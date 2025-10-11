from locust import HttpUser, task, between, events
import logging
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('login_load_test.log'),
        logging.StreamHandler()
    ]
)

class LoginEndpointUser(HttpUser):
    """
    Prueba aislada para POST /api/users/login
    - 300 usuarios
    - Duración: 10-15 min
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)

    @task
    def do_login(self):
        credentials = {"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"}
        with self.client.post(
            "/api/users/login",
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

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("🚀 INICIANDO PRUEBA DE CARGA: LOGIN")
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