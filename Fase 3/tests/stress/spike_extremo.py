from locust import HttpUser, task, between, events
from gevent import sleep, spawn

class FlightExtremeSpikeUser(HttpUser):
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
        def spike_extreme_scenario():
            while environment.runner is None:
                sleep(0.5)

            print("Iniciando Spike Test Extremo")
            print("Fase base: 50 usuarios, spawn rate 20/s (2 minutos)")
            environment.runner.start(user_count=50, spawn_rate=20)
            sleep(120)

            print("Fase pico: 500 usuarios, spawn rate 20/s (5 minutos)")
            environment.runner.start(user_count=500, spawn_rate=20)
            sleep(300)

            print("Fase recuperación: 50 usuarios, spawn rate 20/s (2 minutos)")
            environment.runner.start(user_count=50, spawn_rate=20)
            sleep(120)

            print("Prueba completada. Generando gráfica...")



            environment.runner.quit()

        spawn(spike_extreme_scenario)
