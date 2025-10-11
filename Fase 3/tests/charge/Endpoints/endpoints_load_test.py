from locust import HttpUser, task, between, events
import logging
import time

# Endpoints (basados en tus scripts)
ENDPOINT_LOGIN = "/api/users/login"
ENDPOINT_VUELOS = "/api/vuelos"
ENDPOINT_ESTADISTICAS = "/api/users/estadisticas"
ENDPOINT_PASAJEROS = "/api/users/pasajeros"

# Configurar logging (similar a classic)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('endpoint_load_test.log'),
        logging.StreamHandler()
    ]
)

class LoginEndpointUser(HttpUser):
    """
    Prueba aislada para POST /api/users/login
    - 300 usuarios (carga moderada, ya que es pesado según tus reportes)
    - Duración: 10-15 min
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    @task
    def do_login(self):
        credentials = {"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"}
        with self.client.post(
            ENDPOINT_LOGIN,
            json=credentials,
            headers={"Content-Type": "application/json"},
            catch_response=True,
            name="POST /users/login"
        ) as response:
            if response.status_code == 200:
                response.success()
                if response.elapsed.total_seconds() > 1.0:
                    logging.warning(f"Login lento: {response.elapsed.total_seconds():.2f}s")
            else:
                response.failure(f"Status {response.status_code}")

class VuelosEndpointUser(HttpUser):
    """
    Prueba aislada para GET /api/vuelos
    - 500 usuarios (ligero, según tus reportes)
    - Duración: 10-15 min
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    @task
    def get_vuelos(self):
        with self.client.get(
            ENDPOINT_VUELOS,
            headers={"Content-Type": "application/json"},
            catch_response=True,
            name="GET /vuelos"
        ) as response:
            if response.status_code == 200:
                response.success()
                if response.elapsed.total_seconds() > 0.5:
                    logging.warning(f"Vuelos lentos: {response.elapsed.total_seconds():.2f}s")
            else:
                response.failure(f"Status {response.status_code}")

class EstadisticasEndpointUser(HttpUser):
    """
    Prueba aislada para GET /api/users/estadisticas
    - Requiere login inicial
    - 500 usuarios
    - Duración: 10-15 min
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None

    def on_start(self):
        credentials = {"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"}
        response = self.client.post(ENDPOINT_LOGIN, json=credentials, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            self.token = response.json().get("token")

    @task
    def get_estadisticas(self):
        if not self.token:
            return
        with self.client.get(
            ENDPOINT_ESTADISTICAS,
            headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
            catch_response=True,
            name="GET /users/estadisticas"
        ) as response:
            if response.status_code == 200:
                response.success()
                if response.elapsed.total_seconds() > 0.5:
                    logging.warning(f"Estadísticas lentas: {response.elapsed.total_seconds():.2f}s")
            else:
                response.failure(f"Status {response.status_code}")

class PasajerosEndpointUser(HttpUser):
    """
    Prueba aislada para GET /api/users/pasajeros
    - Requiere login inicial
    - 500 usuarios
    - Duración: 10-15 min
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None

    def on_start(self):
        credentials = {"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"}
        response = self.client.post(ENDPOINT_LOGIN, json=credentials, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            self.token = response.json().get("token")

    @task
    def get_pasajeros(self):
        if not self.token:
            return
        with self.client.get(
            ENDPOINT_PASAJEROS,
            headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
            catch_response=True,
            name="GET /users/pasajeros"
        ) as response:
            if response.status_code == 200:
                response.success()
                if response.elapsed.total_seconds() > 0.5:
                    logging.warning(f"Pasajeros lentos: {response.elapsed.total_seconds():.2f}s")
            else:
                response.failure(f"Status {response.status_code}")

# Event listeners (similar a classic)
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("🚀 INICIANDO PRUEBA DE CARGA POR ENDPOINT")
    logging.info("=" * 60)
    logging.info(f"Host: {environment.host}")
    logging.info("Duración: 10-15 minutos")
    logging.info("=" * 60)

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("✅ PRUEBA COMPLETADA")
    logging.info("=" * 60)
    stats = environment.stats.total
    logging.info(f"📊 RESUMEN: Total Requests: {stats.num_requests}, Failures: {stats.num_failures}, Avg RT: {stats.avg_response_time:.2f}ms, RPS: {stats.total_rps:.2f}")
    # Evaluación similar a tus scripts
    if stats.fail_ratio > 0.01:
        logging.warning("⚠️ Tasa de errores > 1%")
    if stats.avg_response_time > 1000:
        logging.warning("⚠️ Tiempo de respuesta > 1s")