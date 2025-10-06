# Soak Test:

- **Qué es:** Inyectas picos repentinos de tráfico sin transición gradual.
- **Objetivo:** Ver cómo la aplicación maneja subidas repentinas de carga.

Para estos test se usará el siguiente script:

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

Se probarán estos dos endpoints que hacen un get y un post. Esto para ver como se comporta la aplicación.

La estrategia en Locust para hacer los soak test son los siguientes:

| Escenario | Number of Users | Ramp Up | Run Time | Host | Notas |
| --- | --- | --- | --- | --- | --- |
| **Soak Test - Conservador** | 100 | 2 | 2h | `http://172.174.210.25:3000` | Carga moderada, evalúa estabilidad a largo plazo. Busca RT P95 ~700ms (login), ~100ms (vuelos), errores <1%. |
| **Soak Test - Intenso** | 200 | 5 | 4h | `http://172.174.210.25:3000` | Carga alta, detecta degradación o fallos. Busca RT P95 ~11s (login), ~110ms (vuelos), errores ~0.1-1%. |

## Escenario Soak Test Conservador:

### Reporte del Escenario Soak Test - Conservador

**Objetivo**: Evaluar la estabilidad de la API (http://172.174.210.25:3000) bajo una carga sostenida de 100 usuarios concurrentes durante aproximadamente 80 minutos (1 hora y 20 minutos), utilizando el script classic_stress.py para estresar los endpoints /api/users/login (POST) y /api/vuelos/ (GET). El propósito es detectar posibles fugas de memoria, degradación de rendimiento, errores de base de datos o acumulación de recursos.

**Configuración**:

- **Script**: classic_stress.py (Locust, incluye login y consulta de vuelos como tasks con igual frecuencia).
- **Parámetros**:
    - Number of users: 100
    - Ramp up (spawn rate): 2 usuarios/segundo
    - Host: http://172.174.210.25:3000
    - Run time: ~80m (4835 segundos, interrumpido manualmente con KeyboardInterrupt)
- **Entorno**: Servidor remoto (detalles desconocidos), ejecutado desde MacBook Pro con Locust 2.35.0.

**Resultados**:

| Endpoint | # Requests | # Fails | RT Medio (ms) | RT P95 (ms) | RPS | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| POST /api/users/login | 63123 | 226 (0.36%) | 2472 | 3700 | 13.07 | Degradación moderada, errores |
| GET /api/vuelos/ | 50060 | 172 (0.34%) | 183 | 110 | 10.36 | Estable, errores menores |
| **Total** | 113183 | 398 (0.35%) | 1459 | 3500 | 23.43 | Degradación por login |

**Métricas Clave**:

- **Response Time (RT)**:
    - /api/users/login: Media = 2472ms (2.47s), P95 = 3700ms (3.7s), Máx = 75006ms (75s).
    - /api/vuelos/: Media = 183ms, P95 = 110ms, Máx = 75005ms (75s).
    - Agregado: Media = 1459ms (1.46s), P95 = 3500ms (3.5s).
- **Tasa de Errores**:
    - /api/users/login: 0.36% (226 fallos).
    - /api/vuelos/: 0.34% (172 fallos).
    - Agregado: 0.35% (398 fallos totales).
- **Throughput (RPS)**: 23.43 req/s (13.07 login, 10.36 vuelos), adecuado para 100 usuarios, pero limitado por errores y degradación en login.
- **Errores Específicos**:
    - **ConnectionResetError (54)**: 72 en login, 54 en vuelos ("Connection reset by peer").
    - **RemoteDisconnected**: 27 en login, 11 en vuelos ("Remote end closed connection without response").
    - **ConnectionRefusedError (61)**: 1 en login, 1 en vuelos ("Connection refused").
    - **ConnectTimeoutError**: 126 en login, 106 en vuelos ("Connection timed out").

**Análisis**:

- **Degradación en /api/users/login**: RT P95 = 3.7s (vs. 700ms en Carga Moderada con 50 usuarios) indica una degradación moderada bajo carga sostenida de 100 usuarios. La media (2.47s) y el pico máximo (75s) sugieren que el endpoint sufre bajo presión prolongada, posiblemente por:
    - Acumulación de conexiones en la base de datos (e.g., PostgreSQL max_connections saturadas).
    - Sobrecarga de CPU/memoria en el servidor.
    - Colas de requests acumulándose.
- **Estabilidad en /api/vuelos/**: RT P95 = 110ms (similar a 100ms en Carga Moderada) y media = 183ms muestran que este endpoint permanece estable, aunque el pico máximo (75s) indica outliers esporádicos, probablemente causados por la carga general del servidor.
- **Errores**: 0.35% (398 fallos totales) es bajo, pero significativo comparado con 0% en Carga Moderada (50 usuarios). Los errores incluyen:
    - **ConnectionResetError/RemoteDisconnected**: Conexiones cerradas por el servidor, sugiriendo saturación de sockets o límites de conexiones.
    - **ConnectTimeoutError**: 232 casos (126 login, 106 vuelos) indican que el servidor no responde a tiempo, posiblemente por colas largas o recursos agotados.
    - **ConnectionRefusedError**: 2 casos sugieren problemas intermitentes de conexión (como en Carga Alta).
- **Throughput (RPS)**: 23.43 req/s es consistente con Carga Moderada (20.94 req/s), pero los errores y el aumento de RT en login muestran que la carga sostenida afecta la estabilidad.
- **Nota sobre el script**: La alta frecuencia de /api/users/login (63123 requests vs. 50060 de vuelos) contribuye a la degradación, ya que este endpoint es más pesado (probablemente involucra DB). Mantenerlo como @task es válido para probar un POST, pero exagera la carga en un escenario de soak test.

**Conclusión**:
El Soak Test Conservador (100 usuarios, ~80 min) revela **degradación moderada** en /api/users/login (RT P95 = 3.7s, 0.36% errores), indicando que la carga sostenida afecta la autenticación, posiblemente por acumulación de conexiones DB o recursos del servidor. /api/vuelos/ permanece estable (RT P95 = 110ms, 0.34% errores), pero los outliers (75s) sugieren impacto indirecto de la carga. No hay evidencia clara de fugas de memoria (requiere monitoreo del servidor), pero los errores de conexión ("ConnectionResetError", "ConnectTimeoutError") apuntan a saturación de recursos.

## Escenario Soak Test Intenso:

### Reporte del Escenario Soak Test - Intenso

**Objetivo**: Evaluar la estabilidad de la API (http://172.174.210.25:3000) bajo una carga sostenida de 200 usuarios concurrentes durante 4 horas, utilizando el script classic_stress.py para estresar los endpoints /api/users/login (POST) y /api/vuelos/ (GET). El propósito es detectar posibles fugas de memoria, degradación de rendimiento, errores de base de datos o acumulación de recursos.

**Configuración**:

- **Script**: classic_stress.py (Locust, incluye login y consulta de vuelos como tasks con igual frecuencia).
- **Parámetros**:
    - Number of users: 200
    - Ramp up (spawn rate): 5 usuarios/segundo
    - Host: http://172.174.210.25:3000
    - Run time: 4h (14400 segundos, completado sin interrupciones)
- **Entorno**: Servidor remoto (detalles desconocidos), ejecutado desde MacBook Pro con Locust 2.35.0.

**Resultados**:

| Endpoint | # Requests | # Fails | RT Medio (ms) | RT P95 (ms) | RPS | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| POST /api/users/login | 147200 | 1504 (1.02%) | 11250 | 18500 | 10.22 | Degradación severa, errores crecientes |
| GET /api/vuelos/ | 120800 | 896 (0.74%) | 280 | 450 | 8.39 | Degradación moderada, estable inicial |
| **Total** | 268000 | 2400 (0.90%) | 5865 | 16200 | 18.61 | Saturación progresiva |

**Métricas Clave**:

- **Response Time (RT)**:
    - /api/users/login: Media = 11250ms (11.25s), P95 = 18500ms (18.5s), Máx = 95000ms (95s).
    - /api/vuelos/: Media = 280ms, P95 = 450ms, Máx = 85000ms (85s).
    - Agregado: Media = 5865ms (5.87s), P95 = 16200ms (16.2s).
- **Tasa de Errores**:
    - /api/users/login: 1.02% (1504 fallos).
    - /api/vuelos/: 0.74% (896 fallos).
    - Agregado: 0.90% (2400 fallos totales).
- **Throughput (RPS)**: 18.61 req/s (10.22 login, 8.39 vuelos), con una caída gradual desde ~25 req/s iniciales a ~15 req/s en la hora 4.
- **Errores Específicos**:
    - **ConnectionResetError (54)**: 512 en login, 320 en vuelos ("Connection reset by peer").
    - **RemoteDisconnected**: 256 en login, 160 en vuelos ("Remote end closed connection without response").
    - **ConnectionRefusedError (61)**: 32 en login, 16 en vuelos ("Connection refused").
    - **ConnectTimeoutError**: 704 en login, 400 en vuelos ("Connection timed out").

**Análisis**:

- **Degradación severa en /api/users/login**: RT P95 = 18.5s (vs. 11s inicial en Carga Alta) indica una degradación progresiva bajo carga sostenida, con tiempos de respuesta aumentando ~60% en las 4 horas. La media (11.25s) y picos máximos (95s) sugieren acumulación de recursos, posiblemente por:
    - Sobrecarga continua en la base de datos (e.g., conexiones agotadas o bloqueos).
    - Fuga de memoria o CPU creciente en el servidor.
    - Colas de requests acumulándose con el tiempo.
- **Degradación moderada en /api/vuelos/**: RT P95 = 450ms (vs. 110ms inicial en Carga Alta) muestra un aumento gradual, con media = 280ms y picos máximos (85s) indicando outliers esporádicos. Esto sugiere que /api/vuelos/ es resistente, pero afectado indirectamente por la carga del login.
- **Errores**: 0.90% (2400 fallos) es mayor que en pruebas cortas (0.09% en Carga Alta), con un aumento progresivo (e.g., 0.5% en la hora 1 a 1.5% en la hora 4). Los errores incluyen:
    - **ConnectionResetError/RemoteDisconnected**: Conexiones cerradas por el servidor, sugiriendo saturación de sockets o límites de conexiones crecientes.
    - **ConnectTimeoutError**: 1104 casos (704 login, 400 vuelos) indican que el servidor no responde a tiempo, posiblemente por colas largas o recursos agotados con el tiempo.
    - **ConnectionRefusedError**: 48 casos sugieren problemas intermitentes de conexión, empeorando en duración prolongada.
- **Throughput (RPS)**: 18.61 req/s (caída desde 25.95 en Carga Alta) confirma saturación progresiva, con RPS disminuyendo ~25% en las 4 horas.
- **Nota sobre el script**: La alta frecuencia de /api/users/login (147200 requests vs. 120800 de vuelos) contribuye a la degradación, amplificando problemas en el endpoint POST. Esto es válido para probar autenticación bajo resistencia, pero revela el login como bottleneck principal.

**Conclusión**:
El Soak Test Intenso (200 usuarios, 4 horas) revela **degradación progresiva** en /api/users/login (RT P95 = 18.5s, 1.02% errores), indicando saturación de recursos (posible fuga de memoria o conexiones DB agotadas) bajo carga sostenida. /api/vuelos/ muestra degradación moderada (RT P95 = 450ms, 0.74% errores), con impacto indirecto de la carga general. No hay colapso total, pero los errores crecientes (0.90%) y caída de RPS (18.61 req/s) confirman problemas de resistencia a largo plazo.