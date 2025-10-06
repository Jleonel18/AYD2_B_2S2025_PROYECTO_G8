from locust import HttpUser, task, between, events
from gevent import sleep, spawn
import sys

class FlightStressTestUser(HttpUser):
    wait_time = between(2, 5)

    @task
    def login(self):
        self.client.post(
            "/api/users/login",
            json={"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"},
            headers={"Content-Type": "application/json"},
        )

    @task
    def get_all_flights(self):
        self.client.get("/api/vuelos/", headers={"Content-Type": "application/json"})


@events.init.add_listener
def on_locust_init(environment, **kwargs):
    # Solo para modo headless
    if environment.web_ui is None:
        def spike_scenario():
            while environment.runner is None:
                sleep(0.5)

            print("Iniciando prueba de carga con patrón de SPIKE")
            
            print("Carga base: 50 usuarios, 2 usuarios/s (durante 1 min)")
            environment.runner.start(user_count=50, spawn_rate=2)
            sleep(60)

            print("Pico: 300 usuarios, 10 usuarios/s (durante 2 min)")
            environment.runner.start(user_count=300, spawn_rate=10)
            sleep(120)

            print("Recuperación: volver a 50 usuarios, 10 usuarios/s (durante 1 min)")
            environment.runner.start(user_count=50, spawn_rate=10)
            sleep(60)

            print("Prueba completada. Deteniendo ejecución.")
            environment.runner.quit()
            sys.exit(0)  # Asegura que Locust termine correctamente

        spawn(spike_scenario)
