# **Documento de Estado del Proyecto: CRM Rueda la Rola Media**

**Versión:** 2.0 (Plan Detallado)
**Fecha:** 2025-09-03
**Autor:** El Arquitecto

---

### **1. Visión General**

El objetivo es construir una Single Page Application (SPA) interna y segura que centralice la gestión operativa de la agencia. El sistema servirá como única fuente de verdad para clientes, proyectos, tareas y facturación, eliminando la dependencia de herramientas dispersas.

---

### **2. Stack Tecnológico y Dependencias**

* **Framework:** Next.js 15 (App Router)
* **Lenguaje:** JavaScript
* **Estilos:** Tailwind CSS
* **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
* **Despliegue:** Vercel

---

### **3. Checklist de Tareas: Configuración y Arquitectura (Fase 0)**

* **Estado:** `Pendiente`
* **Objetivo:** Preparar el entorno de desarrollo con todas las herramientas y la estructura de archivos necesaria para garantizar la escalabilidad y mantenibilidad del proyecto.

-   [x] **Tarea 0.1: Instalar Dependencias Adicionales.**
    * **Descripción:** Ejecutar el siguiente comando para añadir las librerías necesarias para gestión de estado, formularios, iconos, notificaciones y utilidades de estilo.
    * **Comando:**
        ```bash
        npm install @supabase/supabase-js zustand react-hook-form lucide-react sonner tailwind-variants clsx
        ```

-   [x] **Tarea 0.2: Configurar Variables de Entorno.**
    * **Descripción:** Crear un archivo `.env.local` en la raíz del proyecto. Poblarlo con las claves de Supabase obtenidas del dashboard del proyecto. Estas claves son referenciadas en la documentación del backend.
    * **Contenido de `.env.local`:**
        ```env
        NEXT_PUBLIC_SUPABASE_URL="TU_URL_DE_PROYECTO_SUPABASE"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_ANON_KEY_DE_SUPABASE"
        ```

-   [x] **Tarea 0.3: Crear la Estructura de Carpetas.**
    * **Descripción:** Implementar la arquitectura de directorios definida para separar lógicamente las distintas partes de la aplicación.
    * **Comando:**
        ```bash
        mkdir -p src/app/\(auth\)/login src/app/\(dashboard\)/clients src/app/\(public\)/domain-renewals src/components/ui src/lib/supabase src/hooks src/store
        touch src/app/\(public\)/domain-renewals/page.js src/app/\(public\)/layout.js
        touch src/app/\(dashboard\)/layout.js src/app/\(dashboard\)/page.js
        touch src/app/\(auth\)/login/page.js
        ```

-   [x] **Tarea 0.4: Inicializar el Cliente de Supabase.**
    * **Descripción:** Crear el cliente singleton de Supabase que se utilizará en toda la aplicación del lado del cliente. Dado que usamos Next.js App Router, debemos usar el paquete `@supabase/ssr` para manejar correctamente la autenticación tanto en el servidor como en el cliente.
    * **Archivo:** `src/lib/supabase/client.js`
    * **Código:**
        ```javascript
        import { createBrowserClient } from '@supabase/ssr';

        export function createClient() {
          return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          );
        }
        ```

---

### **4. Roadmap de Desarrollo**

#### **Fase 1: Vista Pública de Gestión de Renovación de Dominios (Prioridad Máxima)**

* **Estado:** `Pendiente`
* **Objetivo:** Crear una página pública y funcional que permita a un administrador gestionar las renovaciones de dominio sin necesidad de autenticación.

-   [ ] **Tarea 1.1: Crear Layout y Página Pública.**
    * **Descripción:** Definir un layout simple para las páginas públicas y la estructura inicial de la página de renovaciones.
    * **Archivos:**
        * `src/app/(public)/layout.js`: Debe contener la estructura HTML básica sin navegación de dashboard.
        * `src/app/(public)/domain-renewals/page.js`: Componente principal de la página.

-   [ ] **Tarea 1.2: Obtener y Mostrar Datos de Dominios.**
    * **Descripción:** Dentro de `page.js`, que será un Server Component por defecto, realizar una llamada directa a Supabase para obtener todos los registros de la tabla `domain_renewals`.
    * **Lógica:** Usar el cliente de Supabase para el lado del servidor. La query debe ser: `supabase.from('domain_renewals').select('*')`.
    * **Resultado:** Pasar los datos obtenidos como `props` a un componente cliente que renderizará la tabla.

-   [ ] **Tarea 1.3: Crear Componente de Tabla de Dominios.**
    * **Descripción:** Desarrollar un componente cliente (`'use client'`) que reciba los datos de los dominios y los muestre en una tabla responsiva.
    * **Archivo:** `src/components/domain-renewals/RenewalsTable.js`
    * **Columnas:** `Dominio`, `Cliente`, `Fecha de Vencimiento`, `Estado`, `Acción (Switch)`.

-   [ ] **Tarea 1.4: Crear la Server Action de Actualización.**
    * **Descripción:** Crear una función asíncrona con la directiva `'use server'` que se encargue de actualizar el estado de una renovación en la base de datos de forma segura.
    * **Archivo:** `src/app/(public)/domain-renewals/actions.js`
    * **Función:** `updateRenewalStatus(domainId, newStatus)` que ejecute: `supabase.from('domain_renewals').update({ is_renewal_approved: newStatus }).eq('id', domainId)`.

-   [ ] **Tarea 1.5: Integrar el Switch con la Server Action.**
    * **Descripción:** En el componente de la tabla, hacer que el interruptor (switch) de cada fila, al ser accionado, invoque a la Server Action `updateRenewalStatus` pasándole el ID del dominio y el nuevo estado. Utilizar `useTransition` de React para manejar el estado pendiente de la actualización y mostrar un feedback visual (ej. un spinner).

#### **Fase 2: Flujo de Autenticación y Acceso (Fundación del CRM)**

* **Estado:** `Bloqueado` (Depende de Fase 0)
* **Objetivo:** Implementar un sistema de inicio de sesión seguro y la protección de todas las rutas internas del CRM.

-   [ ] **Tarea 2.1: Construir el Formulario de Login.**
-   [ ] **Tarea 2.2: Crear el Store de Autenticación con Zustand.**
-   [ ] **Tarea 2.3: Implementar el `AuthListener` en el Layout Raíz.**
-   [ ] **Tarea 2.4: Proteger el Layout del Dashboard.**
-   [ ] **Tarea 2.5: Implementar la verificación `is_active` post-login.**

#### **Fase 3: Módulo de Gestión de Equipo (Vista de Administrador)**

* **Estado:** `Bloqueado` (Depende de Fase 2)
* **Objetivo:** Permitir a los administradores crear, activar y desactivar usuarios del sistema.

-   [ ] **Tarea 3.1: Crear la Vista de Tabla de Miembros del Equipo.**
-   [ ] **Tarea 3.2: Implementar el Modal de Creación de Usuario.**
-   [ ] **Tarea 3.3: Implementar la Lógica de Activación/Desactivación de Usuarios.**