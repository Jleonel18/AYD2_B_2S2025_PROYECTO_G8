from locust import HttpUser, task, between, events
from gevent import sleep, spawn
import sys
import time

class RecoveryTestUser(HttpUser):
    wait_time = between(2, 5)

    @task(2)
    def get_all_flights(self):
        self.client.get(
            "/api/vuelos/",
            headers={"Content-Type": "application/json"},
            name="GET /api/vuelos"
        )

    @task(1)
    def login(self):
        self.client.post(
            "/api/users/login",
            json={"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"},
            headers={"Content-Type": "application/json"},
            name="POST /api/users/login"
        )

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    if environment.web_ui is None:
        def recovery_scenario():
            while environment.runner is None:
                sleep(0.5)

            print("Iniciando Prueba de Recuperación")
            print("Fase inicial: 100 usuarios, 5 minutos")
            environment.runner.start(user_count=100, spawn_rate=10)
            sleep(300)  # 5 minutos

            print("Preparando fallo manual: Detén la API vía SSH ahora (ej. docker-compose stop api)")
            print("Esperando 2 minutos para el fallo y recuperación manual")
            sleep(120)  # 2 minutos para que detengas y reinicies manualmente

            print("Fase de recuperación: 5 minutos")
            sleep(300)  # 5 minutos

            print("Prueba completada. Deteniendo ejecución.")
            environment.runner.quit()
            sys.exit(0)

        spawn(recovery_scenario)

if __name__ == "__main__":
    import os
    os.system("locust -f recovery_test.py --host=http://172.174.210.25:3000 --csv=results_recovery --headless")