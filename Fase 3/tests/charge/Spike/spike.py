from locust import HttpUser, task, between, events
from gevent import sleep, spawn
import sys
import os

class FlightStressTestUser(HttpUser):
    wait_time = between(2, 5)
    # Definimos el host base aquí para no tener que pasar --host
    host = "http://172.174.210.25:3000"

    def on_start(self):
        usuario = os.getenv("TEST_USER", "clopezaaaaa_3823")
        contrasena = os.getenv("TEST_PASSWORD", "1234ABcd")

        with self.client.post(
            "/api/users/login",
            json={"usuario": usuario, "contrasena": contrasena},
            headers={"Content-Type": "application/json"},
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    token = data.get("token") or data.get("access_token")
                    if token:
                        self.client.headers.update({"Authorization": f"Bearer {token}"})
                except Exception:
                    pass
                resp.success()
            else:
                resp.failure(f"Login falló ({resp.status_code})")

    @task(4)
    def get_all_flights(self):
        with self.client.get("/api/vuelos/", headers={"Content-Type": "application/json"}, catch_response=True) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Error vuelos: {r.status_code} {r.text}")

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    # Sólo para modo headless (sin UI)
    if environment.web_ui is None:
        def spike_scenario():
            while environment.runner is None:
                sleep(0.5)

            print("\n=== Iniciando prueba SPIKE ===\n")

            print("Fase base: 50 usuarios, 2 usuarios/s (60 s)")
            environment.runner.start(user_count=50, spawn_rate=2)
            sleep(60)

            print("Fase pico: 300 usuarios, 10 usuarios/s (120 s)")
            environment.runner.start(user_count=300, spawn_rate=10)
            sleep(120)

            print("Fase recuperación: 50 usuarios, 10 usuarios/s (60 s)")
            environment.runner.start(user_count=50, spawn_rate=10)
            sleep(60)

            print("\n✅ Prueba SPIKE completada. Deteniendo.\n")
            environment.runner.quit()
            sys.exit(0)

        spawn(spike_scenario)
