from locust import HttpUser, task, between, events
import logging
import time
import random

ENDPOINT_LOGIN = "/api/users/login"              
ENDPOINT_VUELOS = "/api/vuelos"                 
ENDPOINT_ESTADISTICAS = "/api/users/estadisticas"  
ENDPOINT_PASAJEROS = "/api/users/pasajeros"  

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('load_test_monitoring.log'),
        logging.StreamHandler()
    ]
)

class ClassicLoadTestUser(HttpUser):
    """
    Prueba de Carga Base - 500 usuarios concurrentes
    Objetivo: Verificar rendimiento bajo condiciones normales
    Duración: 10-15 minutos
    """
    host = "http://172.174.210.25:3000"
    wait_time = between(1, 3)  # Tiempo de espera entre requests
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None
        self.vuelos_disponibles = []
        self.request_count = 0
    
    def on_start(self):
        """Login inicial al comenzar"""
        self.do_login()
    
    @task(10)
    def do_login(self):
        """
        Login - Tarea más frecuente (peso 10)
        Simula usuarios autenticándose
        """
        self.request_count += 1
        
        # Usar las mismas credenciales que en soak_test.py
        credentials = {"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"}
        
        with self.client.post(
            ENDPOINT_LOGIN,
            json=credentials,
            headers={"Content-Type": "application/json"},
            catch_response=True,
            name="POST /users/login"
        ) as response:
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.token = data.get("token")
                    response.success()
                    
                    # Log si tarda más de 1 segundo
                    if response.elapsed.total_seconds() > 1.0:
                        logging.warning(
                            f"Login lento: {response.elapsed.total_seconds():.2f}s"
                        )
                except Exception as e:
                    response.failure(f"Error parsing: {e}")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(8)
    def get_vuelos_disponibles(self):
        """
        Consultar vuelos planificados - Peso 8
        Operación más común después del login
        """
        with self.client.get(
            ENDPOINT_VUELOS,
            headers={"Content-Type": "application/json"},
            catch_response=True,
            name="GET /vuelos"
        ) as response:
            
            if response.status_code == 200:
                try:
                    self.vuelos_disponibles = response.json()
                    response.success()
                    
                    # Alertar si tarda más de 500ms
                    if response.elapsed.total_seconds() > 0.5:
                        logging.warning(
                            f"Vuelos lentos: {response.elapsed.total_seconds():.2f}s"
                        )
                except Exception as e:
                    response.failure(f"Parse error: {e}")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(5)
    def get_estadisticas(self):
        """
        Consultar estadísticas - Peso 5
        Requiere autenticación y rol de operaciones
        """
        if not self.token:
            return
        
        with self.client.get(
            ENDPOINT_ESTADISTICAS,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            },
            catch_response=True,
            name="GET /users/estadisticas"
        ) as response:
            
            if response.status_code == 200:
                try:
                    response.success()
                    
                    # Alertar si tarda más de 500ms
                    if response.elapsed.total_seconds() > 0.5:
                        logging.warning(
                            f"Estadísticas lentas: {response.elapsed.total_seconds():.2f}s"
                        )
                except Exception as e:
                    response.failure(f"Parse error: {e}")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(5)
    def get_pasajeros(self):
        """
        Consultar pasajeros - Peso 5
        Requiere autenticación y rol de operaciones
        """
        if not self.token:
            return
        
        with self.client.get(
            ENDPOINT_PASAJEROS,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            },
            catch_response=True,
            name="GET /users/pasajeros"
        ) as response:
            
            if response.status_code == 200:
                try:
                    response.success()
                    
                    # Alertar si tarda más de 500ms
                    if response.elapsed.total_seconds() > 0.5:
                        logging.warning(
                            f"Pasajeros lentos: {response.elapsed.total_seconds():.2f}s"
                        )
                except Exception as e:
                    response.failure(f"Parse error: {e}")
            else:
                response.failure(f"Status {response.status_code}")


# Event listeners para estadísticas
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("🚀 INICIANDO PRUEBA DE CARGA BASE")
    logging.info("=" * 60)
    logging.info(f"Host: {environment.host}")
    logging.info("Usuarios: 500")
    logging.info("Duración: 10 minutos")
    logging.info("=" * 60)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logging.info("=" * 60)
    logging.info("✅ PRUEBA DE CARGA COMPLETADA")
    logging.info("=" * 60)
    
    stats = environment.stats.total
    
    logging.info(f"📊 RESUMEN DE RESULTADOS:")
    logging.info(f"  Total Requests: {stats.num_requests}")
    logging.info(f"  Total Failures: {stats.num_failures}")
    logging.info(f"  Failure Rate: {stats.fail_ratio * 100:.2f}%")
    logging.info(f"  Average Response Time: {stats.avg_response_time:.2f}ms")
    logging.info(f"  Median Response Time: {stats.median_response_time:.2f}ms")
    logging.info(f"  95th Percentile: {stats.get_response_time_percentile(0.95):.2f}ms")
    logging.info(f"  99th Percentile: {stats.get_response_time_percentile(0.99):.2f}ms")
    logging.info(f"  Max Response Time: {stats.max_response_time:.2f}ms")
    logging.info(f"  Requests per Second: {stats.total_rps:.2f}")
    logging.info("=" * 60)
    
    # Evaluación de resultados
    if stats.fail_ratio > 0.05:
        logging.error("❌ CRÍTICO: Tasa de errores > 5%")
    elif stats.fail_ratio > 0.01:
        logging.warning("⚠️  ADVERTENCIA: Tasa de errores > 1%")
    else:
        logging.info("✅ Tasa de errores aceptable")
    
    if stats.avg_response_time > 2000:
        logging.error("❌ CRÍTICO: Tiempo de respuesta promedio > 2s")
    elif stats.avg_response_time > 1000:
        logging.warning("⚠️  ADVERTENCIA: Tiempo de respuesta > 1s")
    else:
        logging.info("✅ Tiempo de respuesta aceptable")