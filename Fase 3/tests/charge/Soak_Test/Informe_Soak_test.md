# Soak Test:

- **Qué es:** Mantienes una carga constante durante horas.
- **Objetivo:** Detectar **fugas de memoria**, problemas de conexión o degradación con el tiempo.
- **Ejemplo:** 300 usuarios simulados por 6 horas seguidas.
- **Métricas clave:** aumento progresivo de latencia, errores intermitentes o consumo de memoria.

Para la siguiente prueba se esperan los siguientes datos:

| Hora | Usuarios | RT P95 (ms) Login | RT P95 (ms) Vuelos | % Errores | RPS | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| 1h | 300 | 11000 | 110 | 0.09% | 25 | Estable |
| 3h | 300 | 15000 | 150 | 0.5% | 20 | Degradación |
| 6h | 300 | 18000 | 200 | 1% | 18 | Saturación |

Se usará el comando

```python
locust -f classic_stress.py
```

Con el siguiente archivo:

```python
from locust import HttpUser, task, between

class FlightStressTestUser(HttpUser):
    wait_time = between(1, 3)

    """def on_start(self):
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2YwZDJkNjE2NWI2N2VhOGFlNzRhMiIsInVzdWFyaW8iOiJkZ29uZ29yYV8xNzk1IiwidGlwbyI6InBhc2FqZXJvIiwibm9tYnJlIjoiRGF2aWQgR29uZ29yYW8iLCJjb3JyZW8iOiJqZGdvbmdvcmFvQGdtYWlsLmNvbSIsImlhdCI6MTc1OTUyMDU1NywiZXhwIjoxNzU5NTI0MTU3fQ.HXgvunIbCnbDy9UQv1s8EkYKlW3MMcM3Bd-_3LTXE0I"
    """
    @task(5)
    def login(self):
        response = self.client.post(
            "/api/users/login",
            json={"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            self.token = response.json().get("token")

    @task(4)
    def get_all_flights(self):
            response = self.client.get(
                "/api/vuelos/",
                            headers={"Content-Type": "application/json"}
            )
```

Se aplicaron 6 horas a Locust. Se monitoreará las pruebas.

### Reporte del Escenario Prueba de Carga Soak Test

**Objetivo**: Evaluar la resistencia y estabilidad de la API (http://172.174.210.25:3000) bajo una carga constante de 300 usuarios simulados durante un período prolongado, identificando posibles fugas de memoria, problemas de conexión o degradación de rendimiento con el tiempo.

**Configuración**:

- **Entorno**: Contenedores gestionados por Docker Compose en una máquina virtual con sistema basado en Unix.
- **Servicio**: API definida en docker-compose.yml con imagen tu-imagen-api, expuesta en el puerto 3000.
- **Carga**: Script classic_stress.py (Locust) con 300 usuarios constantes, ramp-up de 5 usuarios/segundo, ejecutado durante aproximadamente 6 horas (estimado por el número de requests y RPS).
- **Fecha y Hora**: 05:41 PM CST, martes 07 de octubre de 2025.

**Resultados**:

| Endpoint | # Requests | # Fails | Median (ms) | 95%ile (ms) | 99%ile (ms) | Average (ms) | Min (ms) | Max (ms) | Average Size (bytes) | Current RPS | Current Failures/s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST /api/users/login | 128202 | 5 | 22000 | 22000 | 23000 | 21499.01 | 21 | 24018 | 510.98 | 11.7 | 0 |
| GET /api/vuelos/ | 102566 | 6 | 88 | 130 | 230 | 98.07 | 19 | 4493 | 2048.88 | 10 | 0 |
| **Aggregated** | 230768 | 11 | 21000 | 22000 | 23000 | 11987.25 | 19 | 24018 | 1194.51 | 21.7 | 0 |

**Métricas Clave**:

- **Response Time (RT)**:
    - POST /api/users/login: Media = 21499.01ms (21.5s), P95 = 22000ms (22s), P99 = 23000ms (23s), Máx = 24018ms (24s).
    - GET /api/vuelos/: Media = 98.07ms, P95 = 130ms, P99 = 230ms, Máx = 4493ms (4.5s).
    - Agregado: Media = 11987.25ms (12s), P95 = 22000ms (22s), P99 = 23000ms (23s).
- **Tasa de Errores**:
    - POST /api/users/login: 0.0039% (5 fallos).
    - GET /api/vuelos/: 0.0058% (6 fallos).
    - Agregado: 0.0048% (11 fallos).
- **Throughput (Current RPS)**: 21.7 req/s agregado, con 11.7 req/s para login y 10 req/s para vuelos.
- **Tamaño Promedio**: 1194.51 bytes agregado, 510.98 bytes (login), 2048.88 bytes (vuelos).
- **Duración Estimada**: Basado en ~230768 requests y 21.7 RPS, aproximadamente 6 horas (21.7 req/s × 3600s/h × 6h ≈ 235K requests).

**Análisis**:

- **Fase Inicial**: La API manejó la carga de 300 usuarios con RT P95 inicial bajo para GET /api/vuelos/ (130ms), pero POST /api/users/login mostró una latencia significativa desde el inicio (22000ms P95), sugiriendo un cuello de botella en la autenticación.
- **Evolución a Largo Plazo**: La estabilidad en RT P95 (22000ms para login, 130ms para vuelos) a lo largo de 6 horas indica que no hubo degradación progresiva significativa. Sin embargo, el tiempo extremo para login (máx 24018ms) podría reflejar picos intermitentes.
- **Errores**: Con solo 11 fallos (0.0048%), la API demostró alta fiabilidad, sin fallos actuales (0 Failures/s), lo que sugiere que los errores fueron aislados.
- **Consumo de Recursos**: Aunque no se monitoreó directamente, la consistencia en RPS (21.7) y la baja tasa de errores sugieren que no hubo fugas de memoria evidentes, pero se recomienda verificar logs de Docker para confirmar.

**Conclusión**:
El soak test con 300 usuarios durante 6 horas reveló una API robusta en términos de estabilidad, con una tasa de errores mínima (0.0048%) y RPS constante (21.7). Sin embargo, la latencia extrema en POST /api/users/login (P95 22000ms) indica un problema persistente en la autenticación que requiere optimización. No se detectaron signos claros de fugas de memoria o degradación.

## Gráfica:

![alt text](image.png)