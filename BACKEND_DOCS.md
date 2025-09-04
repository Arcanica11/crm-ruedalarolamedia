# Manual Definitivo del Backend: CRM Rueda la Rola Media

**Versión del Documento:** 2.0 (Consolidada)
**Fecha:** 2025-09-03
**Stack Tecnológico:** Supabase (PostgreSQL, Auth, Edge Functions)

---

## 1. Visión General y Filosofía del CRM 🎯

Este CRM es el **sistema nervioso central** de Rueda la Rola Media, diseñado para unificar y optimizar todo el flujo de trabajo de la agencia. Su objetivo es proporcionar una fuente única de verdad para eliminar la dependencia de herramientas dispersas y mejorar la toma de decisiones.

La filosofía se basa en la **claridad y la automatización**: en cualquier momento, cualquier miembro del equipo debe poder entender el estado de los proyectos, y las tareas repetitivas (como el alta de nuevos clientes) deben ser automáticas.

---

## 2. El Flujo de Trabajo Principal: De Cliente a Factura 🌊

Todo en el CRM sigue un ciclo de vida lógico. Entender este flujo es clave para entender la arquitectura del backend.

1.  **Captación (Cliente):** Un cliente es registrado en el sistema, ya sea manualmente por un vendedor o automáticamente a través del formulario de briefing público.
2.  **Planificación (Proyecto):** Se crea un `Proyecto` que funciona como la "orden de trabajo" principal y se asocia al cliente.
3.  **Cotización (Servicios):** Dentro del proyecto, se añaden los `project_items` (servicios del catálogo) con su cantidad y precio. Esto define el alcance y el valor económico del proyecto.
4.  **Ejecución (Tareas):** Cada servicio se desglosa en `Tareas` accionables, cada una con un responsable (`assignee_id`) y una fecha de entrega.
5.  **Revisión y Entrega:** El equipo actualiza el estado de las tareas. Los entregables (`deliverables`), como links a Drive, se asocian a las tareas para la revisión de calidad.
6.  **Cierre (Facturación):** Una vez completado el proyecto, se genera una `Factura` (`invoice`) asociada, y se procede al cobro.



---

## 3. Arquitectura Detallada de la Base de Datos 🏗️

La base de datos PostgreSQL es el núcleo del sistema. Todas las tablas residen en el esquema `public` y están protegidas por **Row Level Security (RLS)**.

### Módulo de Equipo Interno

#### Tabla: `public.team_members`
* **Propósito:** Almacena los perfiles del equipo. Está vinculada 1 a 1 con la tabla `auth.users` de Supabase.
* **Columnas Detalladas:**
| Columna | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ID del usuario, coincide con `auth.users.id`. | **PRIMARY KEY**, **FOREIGN KEY** a `auth.users` |
| `created_at` | `TIMESTAMPTZ` | Fecha de creación del perfil. | `NOT NULL`, `DEFAULT NOW()` |
| `first_name` | `TEXT` | Nombre del miembro del equipo. | `NOT NULL` |
| `last_name` | `TEXT` | Apellido del miembro del equipo. | `NOT NULL` |
| `email` | `TEXT` | Email del usuario. | `NOT NULL`, `UNIQUE` |
| `phone_country_code`| `TEXT` | Indicativo de país para el teléfono. | |
| `phone_number`| `TEXT` | Número de teléfono/WhatsApp. | |
| `profile_type`| `TEXT` | Nivel de acceso. | `NOT NULL`, `CHECK` (`super admin`, `admin`, `team`) |
| `avatar_url`| `TEXT` | URL a la foto de perfil. | |
| `is_active`| `BOOLEAN` | Para activar/desactivar usuarios. | `NOT NULL`, `DEFAULT TRUE` |
| `timezone`| `TEXT` | Zona horaria del usuario. | |

#### Tabla: `public.roles` y `public.team_member_roles`
* **Propósito:** Sistema de roles para definir las funciones de cada miembro del equipo (un miembro puede tener múltiples roles).

---

### Módulo de Clientes y Proyectos

#### Tabla: `public.clients`
* **Propósito:** Contiene toda la información de los clientes de la agencia.
* **Columnas Detalladas:**
| Columna | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Identificador único. | **PRIMARY KEY** (autoincremental) |
| `company_name` | `TEXT` | Nombre de la empresa o cliente. | `NOT NULL`, `UNIQUE` |
| `description` | `TEXT` | Notas y descripción general del cliente. | |
| `industry` | `TEXT` | Gremio o sector del cliente. | |
| ... | ... | (Otras columnas de contacto) | ... |

#### Tabla: `public.projects`
* **Propósito:** La "orden de trabajo" que agrupa todos los servicios solicitados por un cliente en un encargo.
* **Relaciones:** Vinculada a `clients` (un cliente puede tener muchos proyectos).

---
*(...Se omiten las descripciones detalladas de las otras 10 tablas por brevedad, pero en el documento final seguirían este mismo formato detallado...)*

---
## 4. Lógica de Negocio y Automatización ⚙️

#### Trigger de Creación Automática de Perfil
* **¿Qué hace?** Cuando un nuevo usuario se registra en el sistema de autenticación de Supabase (`auth.users`), un trigger se dispara automáticamente.
* **¿Cómo funciona?** Este trigger ejecuta una función SQL (`public.create_new_team_member`) que toma el `id` y `email` del nuevo usuario y crea su perfil correspondiente en la tabla `public.team_members` con valores por defecto.
* **Propósito:** Asegurar que cada usuario del sistema tenga un perfil de equipo asociado sin intervención manual.
* **Código de la Función y Trigger:**
    ```sql
    -- Función que crea el perfil
    CREATE OR REPLACE FUNCTION public.create_new_team_member()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.team_members (id, email, first_name, last_name, profile_type)
      VALUES (
        NEW.id, NEW.email, 'Nuevo', 'Usuario', 'team'
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger que se dispara tras la creación de un usuario
    CREATE OR REPLACE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.create_new_team_member();
    ```

---

## 5. API - Guía de Endpoints y Conexión ⚡

Esta es la guía para que el frontend interactúe con el backend.

### ### Conexión Inicial
```javascript
// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### ### Endpoint Público: `submit-client-briefing`
* **URL:** `POST /functions/v1/submit-client-briefing`
* **Acceso:** Público.
* **Descripción:** Endpoint para el formulario de briefing. Automatiza el alta de clientes y proyectos.
* **Request Body (Payload):**
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `client_name` | `string`| Sí | Nombre del cliente o empresa. |
| `client_email`| `string`| Sí | Email del cliente, se usa como identificador. |
| `brief` | `object`| Sí | Objeto con las respuestas del briefing. |
* **Código Fuente de la Función:**
    ```typescript
    // /supabase/functions/submit-client-briefing/index.ts
    import { createClient } from '[https://esm.sh/@supabase/supabase-js@2](https://esm.sh/@supabase/supabase-js@2)'
    import { corsHeaders } from '../_shared/cors.ts'

    Deno.serve(async (req) => {
      // ... (lógica completa de la función como se detalló anteriormente)
      // 1. Recibir y validar datos.
      // 2. Conectar a Supabase con clave de administrador.
      // 3. Buscar o crear el cliente por email.
      // 4. Crear el proyecto.
      // 5. Crear el briefing.
      // 6. Devolver respuesta.
    });
    ```
*(...El documento continuaría con la misma estructura detallada para el endpoint `submit-domain-renewal`...)*

### ### Operaciones Internas (CRUD Autenticado)
Ejemplos de operaciones para un usuario que ha iniciado sesión.

* **Ver Dashboard Principal (Proyectos y Tareas)**
    ```javascript
    // Obtener proyectos activos y sus tareas asociadas
    const { data, error } = await supabase
      .from('projects')
      .select(`
        project_name,
        status,
        clients ( company_name ),
        tasks ( task_name, status, due_date )
      `)
      .in('status', ['Planificación', 'En Progreso']);
    ```

---

## 6. Seguridad (Row Level Security - RLS) 🔐

La seguridad es primordial. RLS está activado en todas las tablas, lo que significa que por defecto, **nadie puede acceder a nada**. El acceso se concede explícitamente a través de políticas.

#### Plan de Implementación de Políticas de Acceso:
| Tabla | Acción | Perfil `team` | Perfil `admin` | Perfil `super admin` |
| :--- | :--- | :--- | :--- | :--- |
| `projects` | **SELECT** | Sí, todos | Sí, todos | Sí, todos |
| `projects` | **INSERT** | No | Sí | Sí |
| `tasks` | **SELECT** | Sí, todas | Sí, todas | Sí, todas |
| `tasks` | **UPDATE** | Solo si `assignee_id` es el propio usuario | Sí, todas | Sí, todas |
| `invoices` | **SELECT** | No | Sí, todas | Sí, todas |
| `invoices` | **INSERT** | No | Sí | Sí |
| `secure_credentials`| **SELECT** | No | Solo si está asignado al proyecto | Sí, todas |

**Ejemplo de Política RLS (Actualizar Tareas):**
```sql
CREATE POLICY "Allow members to update their own tasks"
ON public.tasks
FOR UPDATE
USING (auth.uid() = assignee_id)
WITH CHECK (auth.uid() = assignee_id);
```