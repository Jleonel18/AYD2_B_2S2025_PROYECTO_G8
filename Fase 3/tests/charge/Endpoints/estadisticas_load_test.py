from locust import HttpUser, task, between, events
import logging
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('estadisticas_load_test.log'),
        logging.StreamHandler()
    ]
)

class EstadisticasEndpointUser(HttpUser):
    """
    Prueba aislada para GET /api/users/estadisticas
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
        response = self.client.post("/api/users/login", json=credentials, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            self.token = response.json().get("token")

    @task
    def get_estadisticas(self):
        if not self.token:
            return
        with self.client.get(
            "/api/users/estadisticas",
            headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
            catch_response=True,
            name="GET /users/estadisticas"
        ) as response:
            if response.status_code == 200:
                response.success()
                if response.elapsed.total_seconds() > 0.5:
                    logging.warning(f"Estadísticas lentos: {response.elapsed.total_seconds():.2f}s")
            else:
                response.failure(f"Status {response.status_code}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("🚀 INICIANDO PRUEBA DE CARGA: ESTADISTICAS")
    logging.info(f"Host: {environment.host}")
    logging.info("Duración: 10-15 minutos")
    logging.info("=" * 60)

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("✅ PRUEBA COMPLETADA")
    stats = environment.stats.total
    logging.info(f"📊 RESUMEN: Total Requests: {stats.num_requests}, Failures: {stats.num_failures}, Avg RT: {stats.avg_response_time:.2f}ms, RPS: {stats.total_rps:.2f}")
    if stats.fail_ratio > 0.01:
        logging.warning("⚠️ Tasa de errores > 1%")
    if stats.avg_response_time > 1000:
        logging.warning("⚠️ Tiempo de respuesta > 1s")