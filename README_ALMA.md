# ¿Puedes domar tu alma? - Documentación

## Descripción

Un sistema de preguntas introspectivo donde los jugadores pueden explorar su verdadera naturaleza cargando imágenes que representen su esencia, seleccionando su tipo de skin (Steve/Alex) y visualizando un modelo 3D de su alma.

## Características

- **Carga de imágenes**: Los jugadores pueden subir cualquier imagen que represente su esencia
- **Selector de tipo**: Opción para elegir entre Steve o Alex (modelos de Minecraft)
- **Vista previa 3D**: Visualización interactiva en 3D con Three.js
- **Diseño responsivo**: Funciona en móviles, tablets y desktop
- **Interfaz intuitiva**: Diseño limpio y minimalista con efectos visuales

## Tecnologías Usadas

- **HTML5**: Estructura del contenido
- **CSS3**: Estilos y animaciones
- **JavaScript**: Lógica de interacción
- **Three.js**: Renderizado 3D interactivo
- **File API**: Carga de imágenes locales

## Archivos Principales

- `domar-tu-alma.html`: Página principal del juego
- Estilos añadidos a `styles.css`
- Lógica JavaScript integrada en el HTML

## Cómo Jugar

1. **Cargar tu skin**: Haz clic en el círculo o arrastra una imagen para subir tu representación visual
2. **Seleccionar tipo**: Elige entre Steve o Alex según tu personalidad
3. **Explorar en 3D**: Usa el ratón para rotar y observar tu modelo 3D desde diferentes ángulos
4. **Comenzar el viaje**: Una vez cargada tu imagen, haz clic en "Comenzar el Viaje"

## Personalización

Puedes modificar fácilmente:

- **Colores**: Cambia las variables CSS `:root` para personalizar el esquema de colores
- **Modelos 3D**: Reemplaza los modelos .bbmodel en `Personajes/Undertale/`
- **Preguntas**: Edita el contenido HTML en la sección `.alma-section`

## Futuras Mejoras

- Sistema de preguntas con múltiples opciones
- Guardado de progreso local
- Galería de skins prediseñadas
- Integración con redes sociales
- Más modelos 3D y texturas
- Sistema de resultados basado en respuestas

## Notas

- La página usa Three.js desde CDN para el renderizado 3D
- Las imágenes se cargan localmente y no se envían a ningún servidor
- Compatible con Chrome, Firefox, Safari y Edge modernos
- Requiere conexión a internet para cargar Three.js

## Autor

JesulutoXD - Animador y desarrollador

## Licencia

Este proyecto es de código abierto para uso personal y educativo.
