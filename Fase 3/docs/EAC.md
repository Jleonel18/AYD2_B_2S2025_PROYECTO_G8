# Escenarios de Atributos de Calidad (EAC) – AirFlow System

## 1. Rendimiento
- **Fuente:** Usuario (operador o pasajero)  
- **Estímulo:** Solicita una actualización de estado de vuelo o realiza una reserva  
- **Entorno:** Durante picos de uso con al menos 1,000 reservas simultáneas  
- **Artefacto:** Módulo de reservas y actualización de vuelos  
- **Respuesta:** El sistema procesa y refleja los cambios en estados de vuelo y reservas  
- **Medida de Respuesta:** Tiempo de respuesta máximo **5 segundos** en operaciones críticas  

---

## 2. Seguridad
- **Fuente:** Actor malicioso o usuario legítimo  
- **Estímulo:** Intenta acceder a datos personales o ejecutar una acción restringida  
- **Entorno:** Durante operación normal en web o panel administrativo  
- **Artefacto:** Módulo de gestión de usuarios y base de datos  
- **Respuesta:** El sistema valida credenciales, restringe accesos según rol y cifra los datos sensibles  
- **Medida de Respuesta:**   
  - Protocolos seguros **HTTPS/TLS** para notificaciones  
  - Acceso denegado a roles no autorizados el **100%** de las veces  

---

## 3. Escalabilidad
- **Fuente:** Crecimiento de la aerolínea  
- **Estímulo:** Incremento de aeronaves (hasta 100) y millones de reservas anuales  
- **Entorno:** Ejecución en infraestructura cloud distribuida  
- **Artefacto:** Arquitectura del sistema (bases de datos y servicios)  
- **Respuesta:** El sistema distribuye carga y mantiene rendimiento estable  
- **Medida de Respuesta:** Escalabilidad horizontal garantizada, soportando al menos **10k de reservas anuales** sin caída de servicio  

---

## 4. Usabilidad / Accesibilidad
- **Fuente:** Pasajero o personal de operaciones  
- **Estímulo:** Interactúa con la interfaz web o panel administrativo  
- **Entorno:** Uso en dispositivos móviles y desktop  
- **Artefacto:** Interfaz gráfica de usuario (frontend)  
- **Respuesta:** El sistema presenta una navegación simple, intuitiva y accesible  
- **Medida de Respuesta:**  
  - Soporte en **100%** de funciones desde dispositivos móviles  
  - Al menos **90%** de usuarios reportan facilidad de uso en pruebas de usabilidad  

---

## 5. Disponibilidad
- **Fuente:** Usuario (pasajero o personal)  
- **Estímulo:** Accede al sistema en cualquier momento  
- **Entorno:** Producción 24/7  
- **Artefacto:** Infraestructura desplegada en la nube.  
- **Respuesta:** El sistema sigue disponible aun en caso de fallo de un nodo  
- **Medida de Respuesta:**  
  - Disponibilidad ≥ **99.9%** (máx. 1 hora de inactividad mensual)  
  - Recuperación automática ≤ **5 minutos** tras fallo  

---

## 6. Mantenibilidad / Evolutividad
- **Fuente:** Equipo de desarrollo  
- **Estímulo:** Necesidad de agregar nueva funcionalidad o corregir errores  
- **Entorno:** Durante ciclo de vida del sistema, usando metodología ágil  
- **Artefacto:** Código fuente y arquitectura modular  
- **Respuesta:** El sistema permite cambios sin afectar módulos independientes  
- **Medida de Respuesta:**  
  - Uso de al menos **5 patrones de diseño**  
  - Nuevos releases desplegados **sin downtime**  

---

## 7. Integración
- **Fuente:** Sistema externo (API de aeropuerto o servicio de correo)  
- **Estímulo:** Solicitud de intercambio de datos o envío de notificación  
- **Entorno:** Operación normal del sistema  
- **Artefacto:** Módulo de integración y comunicación externa  
- **Respuesta:** El sistema envía o recibe información de manera segura y confiable  
- **Medida de Respuesta:**  
  - **100%** de correos enviados a través de protocolos seguros  
  - APIs externas consumidas con latencia < **2 segundos**  
