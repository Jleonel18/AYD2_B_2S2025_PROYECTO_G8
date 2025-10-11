# Scalability Test for API - Locust script
# --------------------------------------------------
# Objetivo:
#   Probar la escalabilidad de la API (https:// or http://host:port) mediante etapas
#   controladas: baseline -> ramp-up -> peak -> sostenimiento -> ramp-down.
#
# Qué incluye este archivo:
# - Script Locust (headless-friendly) que orquesta etapas automáticamente.
# - Tareas: POST /api/users/login  y GET /api/vuelos/ (ajustables).
# - Plantilla de configuración de etapas (STAGES) para editar usuarios, spawn_rate y duración.
# - Guarda un resumen de las etapas en: scalability_test_stages_summary.json
# - Recomendaciones y plantilla de reporte (al final del archivo).
#
# Cómo ejecutar (ver también la sección "HOW TO RUN" dentro del archivo):
#  - En modo headless (recomendado para pruebas reales):
#      locust -f scalability_test_locust.py --headless --csv=scalability_test --loglevel INFO
#  - Para modo distribuido (master + workers), usar los flags --master/--worker según la doc de Locust.
#
# NOTA: Ajustá STAGES, HOST y CREDENTIALS abajo según tu entorno.
# --------------------------------------------------

import os
import sys
import json
import time
import logging
from locust import HttpUser, task, between, events
from gevent import sleep, spawn

logging.basicConfig(format='[%(asctime)s] %(levelname)s: %(message)s', level=logging.INFO)

# ---------------------- CONFIG ----------------------
# Host objetivo (se puede sobreescribir con la opción -H/--host de Locust)
TARGET_HOST = os.getenv("TARGET_HOST", "http://172.174.210.25:3000")

# Credenciales de ejemplo (modificá por valores reales o variables de entorno)
LOGIN_PAYLOAD = {
    "usuario": os.getenv("TEST_USER", "clopezaaaaa_3823"),
    "contrasena": os.getenv("TEST_PASS", "1234ABcd")
}

# Cabeceras por defecto
JSON_HEADERS = {"Content-Type": "application/json"}

# Etapas de la prueba: cada etapa = dict(label, users, spawn_rate, duration_seconds)
# Modificá estos valores según tu objetivo de escalabilidad.
# Duraciones en segundos. Valores propuestos (ejemplo realista para un test de escalabilidad):
STAGES = [
    {"label": "Baseline", "users": 50,  "spawn_rate": 10,  "duration": 120},   # 2 minutos
    {"label": "Ramp-Up 1", "users": 200, "spawn_rate": 20,  "duration": 600},  # 10 minutos
    {"label": "Ramp-Up 2", "users": 500, "spawn_rate": 50,  "duration": 600},  # 10 minutos
    {"label": "Peak",      "users": 1000, "spawn_rate": 100, "duration": 300},  # 5 minutos
    {"label": "Sustain",   "users": 1000, "spawn_rate": 100, "duration": 300},  # 5 minutos
    {"label": "Ramp-Down", "users": 50,  "spawn_rate": 200, "duration": 180},  # 3 minutos
]

# Archivo donde escribimos el resumen de etapas (local)
STAGES_SUMMARY_FILE = os.getenv("STAGES_SUMMARY_FILE", "scalability_test_stages_summary.json")

# Umbrales recomendados (ajustá según SLA)
THRESHOLDS = {
    "p95_login_ms": 2000,   # p95 acceptable for login (2s)
    "error_rate_pct": 1.0,  # acceptable error rate in percent
}

# -----------------------------------------------------

class FlightStressUser(HttpUser):
    # No definimos host aquí, usamos el flag -H o TARGET_HOST si prefieren.
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    @task(1)
    def login(self):
        # Usamos catch_response para marcar fallos explícitos
        with self.client.post(
            "/api/users/login",
            json=LOGIN_PAYLOAD,
            headers=JSON_HEADERS,
            catch_response=True,
            name="POST /api/users/login",
        ) as response:
            status = response.status_code
            # Consideramos 200 o 201 como éxito (ajustá según tu API)
            if status not in (200, 201):
                response.failure(f"HTTP {status}")
            else:
                # Opcional: validar esquema/simple sanity
                if response.elapsed.total_seconds() > 30:
                    response.failure("latency > 30s")

    @task(3)
    def get_all_flights(self):
        with self.client.get(
            "/api/vuelos/",
            headers=JSON_HEADERS,
            catch_response=True,
            name="GET /api/vuelos/",
        ) as response:
            status = response.status_code
            if status != 200:
                response.failure(f"HTTP {status}")

# ------------------ Orquestador de Etapas ------------------
@events.init.add_listener
def on_locust_init(environment, **kwargs):
    # Ejecutamos la orquestación solo en modo headless (sin UI) para evitar interferencias
    if environment.web_ui is None:
        def _run_stages():
            # Esperar a que runner esté listo
            while environment.runner is None:
                sleep(0.5)

            logging.info("INICIO: Scalability Test Orchestrator")
            test_start = time.time()
            stages_info = []

            for stage in STAGES:
                label = stage.get("label", "stage")
                users = int(stage.get("users", 0))
                spawn_rate = float(stage.get("spawn_rate", max(1, users // 10)))
                duration = int(stage.get("duration", 60))

                logging.info(f"Stage '{label}': start -> users={users}, spawn_rate={spawn_rate}, duration={duration}s")
                try:
                    environment.runner.start(user_count=users, spawn_rate=spawn_rate)
                except Exception as e:
                    logging.exception(f"Error starting users for stage {label}: {e}")

                # Mantener la etapa durante su duración
                t0 = time.time()
                sleep(duration)
                t1 = time.time()

                # Guardamos resumen parcial (no metricas de locust; esas las exporta --csv)
                stages_info.append({
                    "label": label,
                    "users": users,
                    "spawn_rate": spawn_rate,
                    "duration_s": round(t1 - t0, 2),
                    "ts_start": t0,
                    "ts_end": t1,
                })

                logging.info(f"Stage '{label}': ended (elapsed {round(t1 - t0,2)}s)")

            total_elapsed = time.time() - test_start
            summary = {
                "target_host": os.getenv("TARGET_HOST", TARGET_HOST),
                "stages": stages_info,
                "total_elapsed_s": round(total_elapsed, 2),
                "generated_at": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime()),
            }

            # Intentamos escribir el resumen localmente
            try:
                with open(STAGES_SUMMARY_FILE, "w") as f:
                    json.dump(summary, f, indent=2)
                logging.info(f"Wrote stages summary to {STAGES_SUMMARY_FILE}")
            except Exception as e:
                logging.exception(f"Failed to write summary: {e}")

            logging.info("Scalability Test finished. Stopping runner...")
            try:
                environment.runner.quit()
            except Exception:
                pass

            # Forzamos salida para que el contenedor/proceso termine (headless)
            sys.exit(0)

        spawn(_run_stages)

# ------------------ Report / checklist (plantilla) ------------------
# Dentro de este script se incluye una plantilla breve que podés copiar/pegar en un .md
# para tu reporte final.
# --------------------------------------------------
# PLANTILLA DE REPORTE (copiar a .md si querés):
#
# # Informe de Prueba de Escalabilidad
#
# **Objetivo:** Evaluar la escalabilidad de la API ante incremento progresivo de carga.
#
# **Configuración de la prueba:**
# - Host: <REEMPLAZAR> (usar TARGET_HOST o flag -H)
# - Etapas: editar STAGES en el script
# - Comando de ejecución: `locust -f scalability_test_locust.py --headless --csv=scalability_test --loglevel INFO`
#
# **Métricas a capturar:**
# - Latencias: p50, p95, p99 (por endpoint)
# - Throughput (RPS)
# - Tasa de errores (error rate %)
# - Saturación de recursos: CPU, RAM, conexiones DB, qps DB
# - Tiempo hasta recuperación después del peak
#
# **Criterios de aceptación propuestos:**
# - p95 login < {p95_login_ms} ms
# - error rate < {error_rate_pct}%
# - no degradación sostenida en endpoints críticos (ej: /api/vuelos/)
#
# **Recomendaciones técnicas (si se observan problemas):**
# - Implementar cache en endpoints de lectura frecuentemente llamados.
# - Revisar pool de conexiones a DB (tamaño, timeouts).
# - Evaluar auto-scaling horizontal del servicio de autenticación.
# - Analizar y optimizar queries lentos y dependencias externas.
#
# --------------------------------------------------
# FIN DEL ARCHIVO
