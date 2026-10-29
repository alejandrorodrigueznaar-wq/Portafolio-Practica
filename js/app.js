/**
 * ============================================================================
 * PORTAFOLIO DE PRÁCTICA PROFESIONAL - APLICACIÓN PRINCIPAL
 * Carga de datos dinámica, gestión de filtros reactivos y visor modal
 * ============================================================================
 */

(function () {
  'use strict';

  // ESTADO GLOBAL DE LA APLICACIÓN
  const state = {
    estudiante: {},
    personas: [],
    trabajos: [],
    filtros: {
      texto: '',
      personaId: 'todos',
      tipo: 'todos'
    },
    ultimoElementoEnfocado: null
  };

  // DATOS DE RESPALDO (Fallback para ejecución local vía protocolo file://)
  const FALLBACK_DATA = {
    "estudiante": {
      "nombre": "Nahum",
      "titulo": "Portafolio de Práctica Profesional",
      "carrera": "Práctica Profesional Supervisada • UNAH",
      "universidad": "Universidad Nacional Autónoma de Honduras (UNAH)",
      "institucion": "Instituto Nacional de Previsión del Magisterio (INPREMA)",
      "periodo": "2026",
      "presentacion": "Portafolio digital que recopila los proyectos, informes técnicos, diagramas y herramientas de gestión desarrollados durante mi práctica profesional supervisada. Cada trabajo refleja el esfuerzo colaborativo junto a los profesionales del departamento para optimizar procesos institucionales y la atención al docente."
    },
    "personas": [
      {
        "id": "kevin-espinoza",
        "nombre": "Ing. Kevin Espinoza",
        "cargo": "Especialista en Procesos y Sistemas",
        "area": "Gestión de Calidad y Procesos",
        "foto": ""
      },
      {
        "id": "marvin-alvarez",
        "nombre": "Ing. Marvin Alvarez",
        "cargo": "Especialista en Calidad e Innovación",
        "area": "Transformación y Calidad Institucional",
        "foto": ""
      },
      {
        "id": "gabriela-alvarez",
        "nombre": "Lic. Gabriela Alvarez",
        "cargo": "Coordinadora de Calidad y Atención",
        "area": "Dirección de Gestión de Calidad (DGC)",
        "foto": ""
      }
    ],
    "trabajos": [
      {
        "id": "t1",
        "titulo": "Análisis de Requerimientos y Flujos para Módulo de Afiliaciones",
        "tipo": "Informe",
        "fecha": "2026-08",
        "resumen": "Levantamiento de especificaciones técnicas y operativas para el registro y actualización de datos de afiliados, definiendo validaciones de identidad y reglas de negocio del sistema institucional.",
        "archivo": "documentos/analisis-requerimiento-afiliaciones.pdf",
        "personas": ["kevin-espinoza"]
      },
      {
        "id": "t2",
        "titulo": "Informe y Dinámica de Capacitación: Campaña La Chispa Innovadora",
        "tipo": "Presentación",
        "fecha": "2026-08",
        "resumen": "Diseño metodológico y ejecución de actividades interactivas para fomentar la cultura de calidad, innovación y vocación de servicio en las distintas dependencias de atención.",
        "archivo": "documentos/informe-capacitacion-chispa.pdf",
        "personas": ["gabriela-alvarez", "marvin-alvarez"]
      },
      {
        "id": "t3",
        "titulo": "Diagrama del Organigrama y Estructura Funcional Institucional",
        "tipo": "Diagrama",
        "fecha": "2026-07",
        "resumen": "Mapeo visual integral de las dependencias jerárquicas y operativas de la institución, facilitando la comprensión de canales de reporte y áreas de apoyo a la previsión magisterial.",
        "archivo": "documentos/diagrama-organigrama-institucional.jpg",
        "personas": ["kevin-espinoza", "marvin-alvarez"]
      },
      {
        "id": "t4",
        "titulo": "Estandarización de Identidad Visual y Señalética Institucional",
        "tipo": "Informe",
        "fecha": "2026-09",
        "resumen": "Guía técnica para la correcta aplicación gráfica y protocolos visuales en documentos oficiales, cartelería de servicio y puntos de contacto con docentes y afiliados.",
        "archivo": "documentos/identidad-institucional.png",
        "personas": ["marvin-alvarez"]
      },
      {
        "id": "t5",
        "titulo": "Matriz de Control de Calidad en Ventanillas de Atención Regional",
        "tipo": "Hoja de cálculo",
        "fecha": "2026-10",
        "resumen": "Herramienta cuantitativa para auditar tiempos de respuesta, atención al usuario e infraestructura en ventanillas regionales, permitiendo la generación de indicadores de desempeño.",
        "archivo": "documentos/control-calidad-ventanillas.xlsx",
        "personas": ["gabriela-alvarez", "kevin-espinoza"]
      }
    ]
  };

  // ELEMENTOS DEL DOM
  const dom = {
    contenedorPersonas: document.getElementById('contenedor-personas'),
    contenedorTrabajos: document.getElementById('contenedor-trabajos'),
    inputBusqueda: document.getElementById('input-busqueda'),
    selectPersona: document.getElementById('select-persona'),
    chipsTipo: document.querySelectorAll('#contenedor-chips-tipo .chip'),
    btnLimpiarTodo: document.getElementById('btn-limpiar-todo'),
    contadorResultados: document.getElementById('contador-resultados'),
    bannerPersonaActiva: document.getElementById('banner-persona-activa'),
    nombrePersonaFiltrada: document.getElementById('nombre-persona-filtrada'),
    btnQuitarFiltroPersona: document.getElementById('btn-quitar-filtro-persona'),
    
    // Elementos del Modal
    modalVisor: document.getElementById('modal-visor'),
    modalTitulo: document.getElementById('modal-doc-titulo'),
    modalTipo: document.getElementById('modal-doc-tipo'),
    modalFecha: document.getElementById('modal-doc-fecha'),
    modalContenido: document.getElementById('modal-contenido-vista'),
    modalColaboradores: document.getElementById('modal-doc-colaboradores'),
    btnDescargar: document.getElementById('btn-descargar-archivo'),
    btnCerrarModal: document.getElementById('btn-cerrar-modal'),
    btnCerrarModalSecundario: document.getElementById('btn-cerrar-modal-secundario'),

    // Elementos del Hero
    headerEstudiante: document.getElementById('header-estudiante'),
    headerTitulo: document.getElementById('header-titulo'),
    headerPresentacion: document.getElementById('header-presentacion'),
    headerInstitucion: document.getElementById('header-institucion'),
    headerCarrera: document.getElementById('header-carrera'),
    metaColaboradoresCount: document.getElementById('meta-colaboradores-count'),
    metaTrabajosCount: document.getElementById('meta-trabajos-count')
  };

  // INICIALIZACIÓN
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await cargarDatos();
    actualizarHero();
    poblarSelectorPersonas();
    renderizarPersonas();
    renderizarTrabajos();
    registrarEventos();
  }

  // CARGA DE DATOS (data/trabajos.json con fallback)
  async function cargarDatos() {
    try {
      const response = await fetch('data/trabajos.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      state.estudiante = data.estudiante || FALLBACK_DATA.estudiante;
      state.personas = Array.isArray(data.personas) ? data.personas : FALLBACK_DATA.personas;
      state.trabajos = Array.isArray(data.trabajos) ? data.trabajos : FALLBACK_DATA.trabajos;
    } catch (error) {
      console.warn('No se pudo cargar data/trabajos.json directamente (posible restricción CORS en protocolo file://). Cargando datos de respaldo...', error);
      state.estudiante = FALLBACK_DATA.estudiante;
      state.personas = FALLBACK_DATA.personas;
      state.trabajos = FALLBACK_DATA.trabajos;
    }
  }

  // ACTUALIZACIÓN DE DATOS DEL ENCABEZADO
  function actualizarHero() {
    if (state.estudiante) {
      if (dom.headerEstudiante && state.estudiante.nombre) dom.headerEstudiante.textContent = state.estudiante.nombre;
      if (dom.headerTitulo && state.estudiante.titulo) dom.headerTitulo.textContent = state.estudiante.titulo;
      if (dom.headerPresentacion && state.estudiante.presentacion) dom.headerPresentacion.textContent = state.estudiante.presentacion;
      if (dom.headerInstitucion && state.estudiante.institucion) dom.headerInstitucion.textContent = state.estudiante.institucion;
      if (dom.headerCarrera && state.estudiante.carrera) dom.headerCarrera.textContent = state.estudiante.carrera;
    }
    if (dom.metaColaboradoresCount) {
      dom.metaColaboradoresCount.textContent = `${state.personas.length} Colaboradores`;
    }
    if (dom.metaTrabajosCount) {
      dom.metaTrabajosCount.textContent = `${state.trabajos.length} Trabajos y proyectos`;
    }
  }

  // SELECTOR DE PERSONAS
  function poblarSelectorPersonas() {
    if (!dom.selectPersona) return;
    // Conserva la primera opción "Todos"
    dom.selectPersona.innerHTML = '<option value="todos">Todos los colaboradores</option>';
    state.personas.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.nombre;
      dom.selectPersona.appendChild(option);
    });
  }

  // OBTENER INICIALES PARA EL AVATAR
  function obtenerIniciales(nombre) {
    if (!nombre) return 'P';
    const partes = nombre.trim().split(/\s+/);
    // Filtrar títulos comunes como "Ing.", "Lic.", "Dr."
    const nombresReales = partes.filter(p => !['ing.', 'ing', 'lic.', 'lic', 'dr.', 'dr', 'dra.', 'dra', 'msc.', 'msc'].includes(p.toLowerCase()));
    if (nombresReales.length >= 2) {
      return (nombresReales[0][0] + nombresReales[1][0]).toUpperCase();
    } else if (nombresReales.length === 1) {
      return nombresReales[0].substring(0, 2).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  }

  // FORMATEAR FECHA (ej. "2026-08" -> "Agosto 2026")
  function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length === 2) {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesIndex = parseInt(partes[1], 10) - 1;
      const anio = partes[0];
      if (mesIndex >= 0 && mesIndex < 12) {
        return `${meses[mesIndex]} ${anio}`;
      }
    }
    return fechaStr;
  }

  // OBTENER CLASE DE BADGE POR TIPO
  function normalizarClaseTipo(tipo) {
    if (!tipo) return 'tipo-otro';
    const t = tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes('informe')) return 'tipo-informe';
    if (t.includes('presentacion')) return 'tipo-presentacion';
    if (t.includes('diagrama')) return 'tipo-diagrama';
    if (t.includes('calculo') || t.includes('hoja')) return 'tipo-hoja-de-calculo';
    return 'tipo-otro';
  }

  // RENDERIZAR SECCIÓN DE COLABORADORES
  function renderizarPersonas() {
    if (!dom.contenedorPersonas) return;
    dom.contenedorPersonas.innerHTML = '';

    state.personas.forEach(persona => {
      // Calcular número de trabajos con esta persona
      const totalTrabajos = state.trabajos.filter(t => t.personas && t.personas.includes(persona.id)).length;

      const card = document.createElement('article');
      card.className = `persona-card ${state.filtros.personaId === persona.id ? 'active' : ''}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', state.filtros.personaId === persona.id ? 'true' : 'false');
      card.setAttribute('aria-label', `Filtrar trabajos de ${persona.nombre}, ${persona.cargo}`);
      card.dataset.personaId = persona.id;

      const iniciales = obtenerIniciales(persona.nombre);

      card.innerHTML = `
        <div class="persona-card-header">
          <div class="avatar-container" aria-hidden="true">
            ${persona.foto 
              ? `<img src="${persona.foto}" alt="${persona.nombre}" class="avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'avatar-initials\\'>${iniciales}</div>';">` 
              : `<div class="avatar-initials">${iniciales}</div>`
            }
          </div>
          <div class="persona-info">
            <h3 class="persona-name">${persona.nombre}</h3>
            <p class="persona-role">${persona.cargo}</p>
            <p class="persona-area">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              ${persona.area}
            </p>
          </div>
        </div>
        <div class="persona-footer">
          <span class="persona-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <strong>${totalTrabajos}</strong> ${totalTrabajos === 1 ? 'trabajo' : 'trabajos'}
          </span>
          <span class="persona-action-hint">
            Ver trabajos &rarr;
          </span>
        </div>
      `;

      // Eventos para seleccionar la persona
      const activarPersona = () => {
        if (state.filtros.personaId === persona.id) {
          // Si ya está seleccionada, desactivar y mostrar todos
          aplicarFiltroPersona('todos');
        } else {
          aplicarFiltroPersona(persona.id);
          // Scroll suave hacia la sección de trabajos
          const seccionTrabajos = document.getElementById('seccion-trabajos');
          if (seccionTrabajos) {
            seccionTrabajos.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      card.addEventListener('click', activarPersona);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activarPersona();
        }
      });

      dom.contenedorPersonas.appendChild(card);
    });
  }

  // RENDERIZAR SECCIÓN DE TRABAJOS SEGÚN FILTROS
  function renderizarTrabajos() {
    if (!dom.contenedorTrabajos) return;

    // Filtrado reactivo
    const resultados = state.trabajos.filter(trabajo => {
      // 1. Filtro por persona
      if (state.filtros.personaId !== 'todos') {
        if (!trabajo.personas || !trabajo.personas.includes(state.filtros.personaId)) {
          return false;
        }
      }

      // 2. Filtro por tipo de documento
      if (state.filtros.tipo !== 'todos') {
        const tipoNormalizado = trabajo.tipo.toLowerCase().trim();
        const tipoFiltro = state.filtros.tipo.toLowerCase().trim();
        if (!tipoNormalizado.includes(tipoFiltro)) {
          return false;
        }
      }

      // 3. Filtro por palabra clave (título, resumen, personas)
      if (state.filtros.texto.trim() !== '') {
        const query = state.filtros.texto.toLowerCase().trim();
        const enTitulo = trabajo.titulo.toLowerCase().includes(query);
        const enResumen = trabajo.resumen.toLowerCase().includes(query);
        const nombresColaboradores = (trabajo.personas || [])
          .map(pId => {
            const p = state.personas.find(item => item.id === pId);
            return p ? p.nombre.toLowerCase() : '';
          })
          .join(' ');
        const enColaboradores = nombresColaboradores.includes(query);

        if (!enTitulo && !enResumen && !enColaboradores) {
          return false;
        }
      }

      return true;
    });

    // Actualizar barra de estado y contador
    if (dom.contadorResultados) {
      dom.contadorResultados.innerHTML = `Mostrando <strong>${resultados.length}</strong> de <strong>${state.trabajos.length}</strong> trabajos`;
    }

    // Actualizar banner de persona activa
    if (dom.bannerPersonaActiva) {
      if (state.filtros.personaId !== 'todos') {
        const personaActual = state.personas.find(p => p.id === state.filtros.personaId);
        if (dom.nombrePersonaFiltrada) {
          dom.nombrePersonaFiltrada.textContent = personaActual ? personaActual.nombre : state.filtros.personaId;
        }
        dom.bannerPersonaActiva.style.display = 'flex';
      } else {
        dom.bannerPersonaActiva.style.display = 'none';
      }
    }

    // Actualizar estado activo en tarjetas de personas
    document.querySelectorAll('.persona-card').forEach(card => {
      const esActiva = card.dataset.personaId === state.filtros.personaId;
      card.classList.toggle('active', esActiva);
      card.setAttribute('aria-pressed', esActiva ? 'true' : 'false');
    });

    dom.contenedorTrabajos.innerHTML = '';

    // Manejo de estado vacío (sin coincidencias)
    if (resultados.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state fade-in';
      emptyDiv.innerHTML = `
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="8"/></svg>
        <h3 class="empty-title">No se encontraron trabajos</h3>
        <p class="empty-text">No hay entregables que coincidan con los criterios de búsqueda o filtros seleccionados.</p>
        <button type="button" class="btn-primary" id="btn-reintentar-filtros">
          Restablecer todos los filtros
        </button>
      `;
      dom.contenedorTrabajos.appendChild(emptyDiv);

      const btnReintentar = document.getElementById('btn-reintentar-filtros');
      if (btnReintentar) {
        btnReintentar.addEventListener('click', limpiarTodosLosFiltros);
      }
      return;
    }

    // Renderizar tarjetas de trabajos
    resultados.forEach(trabajo => {
      const card = document.createElement('article');
      card.className = 'trabajo-card fade-in';
      card.dataset.id = trabajo.id;

      const claseTipo = normalizarClaseTipo(trabajo.tipo);
      const fechaFormateada = formatearFecha(trabajo.fecha);

      // Resolver nombres de colaboradores
      const colaboradoresHtml = (trabajo.personas || [])
        .map(pId => {
          const persona = state.personas.find(p => p.id === pId);
          if (!persona) return '';
          return `
            <button type="button" class="colaborador-tag" data-persona-id="${persona.id}" title="Filtrar por ${persona.nombre}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${persona.nombre}
            </button>
          `;
        })
        .join('');

      card.innerHTML = `
        <div class="trabajo-header">
          <span class="badge-tipo ${claseTipo}">
            ${trabajo.tipo}
          </span>
          <span class="trabajo-fecha">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${fechaFormateada}
          </span>
        </div>

        <h3 class="trabajo-title">${trabajo.titulo}</h3>
        <p class="trabajo-resumen">${trabajo.resumen}</p>

        <div class="trabajo-colaboradores">
          <div class="colaboradores-label">Desarrollado con:</div>
          <div class="colaboradores-tags">
            ${colaboradoresHtml}
          </div>
        </div>

        <div class="trabajo-footer">
          <button type="button" class="btn-primary btn-ver-documento" data-id="${trabajo.id}" aria-label="Ver documento: ${trabajo.titulo}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver documento
          </button>
        </div>
      `;

      // Evento para abrir visor al presionar "Ver documento"
      const btnVerDoc = card.querySelector('.btn-ver-documento');
      if (btnVerDoc) {
        btnVerDoc.addEventListener('click', () => abrirModalVisor(trabajo, btnVerDoc));
      }

      // Evento para filtrar al hacer click en los tags de colaboradores
      card.querySelectorAll('.colaborador-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = tag.dataset.personaId;
          aplicarFiltroPersona(pId);
        });
      });

      dom.contenedorTrabajos.appendChild(card);
    });
  }

  // GESTIÓN DEL MODAL VISOR DE DOCUMENTOS
  function abrirModalVisor(trabajo, elementoDisparador) {
    if (!dom.modalVisor) return;
    state.ultimoElementoEnfocado = elementoDisparador || document.activeElement;

    // Actualizar metadatos del modal
    if (dom.modalTitulo) dom.modalTitulo.textContent = trabajo.titulo;
    if (dom.modalFecha) dom.modalFecha.textContent = formatearFecha(trabajo.fecha);

    if (dom.modalTipo) {
      dom.modalTipo.textContent = trabajo.tipo;
      dom.modalTipo.className = `badge-tipo ${normalizarClaseTipo(trabajo.tipo)}`;
    }

    // Colaboradores asociados
    if (dom.modalColaboradores) {
      const nombres = (trabajo.personas || [])
        .map(pId => {
          const p = state.personas.find(item => item.id === pId);
          return p ? p.nombre : '';
        })
        .filter(Boolean)
        .join(', ');
      dom.modalColaboradores.textContent = nombres ? `Colaboración: ${nombres}` : '';
    }

    // Botón descargar
    if (dom.btnDescargar) {
      dom.btnDescargar.href = trabajo.archivo || '#';
      dom.btnDescargar.setAttribute('download', trabajo.archivo ? trabajo.archivo.split('/').pop() : 'documento');
    }

    // Renderizar previsualización adaptativa según tipo de archivo
    if (dom.modalContenido) {
      dom.modalContenido.innerHTML = '';
      const archivo = trabajo.archivo || '';
      const extension = archivo.split('.').pop().toLowerCase();

      if (extension === 'pdf') {
        // PDF: Iframe con visor nativo
        dom.modalContenido.innerHTML = `
          <iframe 
            src="${archivo}#toolbar=1&navpanes=0" 
            class="modal-frame" 
            title="Vista previa del documento: ${trabajo.titulo}">
            <p>Tu navegador no soporta la visualización incrustada de PDFs. 
               <a href="${archivo}" download>Haz clic aquí para descargar el archivo PDF</a>.
            </p>
          </iframe>
        `;
      } else if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(extension)) {
        // Imagen: Contenedor con zoomable img
        dom.modalContenido.innerHTML = `
          <div style="padding: 1.5rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
            <img 
              src="${archivo}" 
              alt="${trabajo.titulo}" 
              class="modal-image"
              loading="lazy">
          </div>
        `;
      } else {
        // Archivos como Excel (.xlsx), Word (.docx) o generales
        let icono = `
          <svg class="file-preview-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        `;
        if (['xlsx', 'xls', 'csv'].includes(extension)) {
          icono = `
            <svg class="file-preview-icon" style="color: var(--badge-calculo);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          `;
        }

        dom.modalContenido.innerHTML = `
          <div class="file-preview-card fade-in">
            ${icono}
            <h4 class="file-preview-name">${archivo.split('/').pop()}</h4>
            <p class="file-preview-notice">
              Este tipo de archivo <strong>(${extension.toUpperCase()})</strong> se abre y edita en aplicaciones de escritorio (como Excel o Calc). Puedes descargar la versión original para revisarlo directamente.
            </p>
            <a href="${archivo}" download class="btn-primary" style="margin: 0 auto; display: inline-flex;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar archivo (${extension.toUpperCase()})
            </a>
          </div>
        `;
      }
    }

    // Mostrar modal
    dom.modalVisor.classList.add('active');
    dom.modalVisor.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Poner foco en el botón de cerrar
    if (dom.btnCerrarModal) {
      setTimeout(() => dom.btnCerrarModal.focus(), 100);
    }
  }

  function cerrarModalVisor() {
    if (!dom.modalVisor) return;
    dom.modalVisor.classList.remove('active');
    dom.modalVisor.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Limpiar iframe para detener reproducción o consumo de recursos
    if (dom.modalContenido) {
      dom.modalContenido.innerHTML = '';
    }

    // Devolver foco al elemento disparador
    if (state.ultimoElementoEnfocado && typeof state.ultimoElementoEnfocado.focus === 'function') {
      state.ultimoElementoEnfocado.focus();
    }
  }

  // ACCIONES DE FILTRO
  function aplicarFiltroPersona(personaId) {
    state.filtros.personaId = personaId;
    if (dom.selectPersona) {
      dom.selectPersona.value = personaId;
    }
    renderizarTrabajos();
  }

  function aplicarFiltroTipo(tipo) {
    state.filtros.tipo = tipo;
    dom.chipsTipo.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tipo === tipo);
    });
    renderizarTrabajos();
  }

  function limpiarTodosLosFiltros() {
    state.filtros.texto = '';
    state.filtros.personaId = 'todos';
    state.filtros.tipo = 'todos';

    if (dom.inputBusqueda) dom.inputBusqueda.value = '';
    if (dom.selectPersona) dom.selectPersona.value = 'todos';
    dom.chipsTipo.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tipo === 'todos');
    });

    renderizarTrabajos();
  }

  // REGISTRO DE EVENTOS
  function registrarEventos() {
    // 1. Buscador por texto con debounce
    if (dom.inputBusqueda) {
      let timeoutId;
      dom.inputBusqueda.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          state.filtros.texto = e.target.value;
          renderizarTrabajos();
        }, 200);
      });
    }

    // 2. Selector desplegable de personas
    if (dom.selectPersona) {
      dom.selectPersona.addEventListener('change', (e) => {
        aplicarFiltroPersona(e.target.value);
      });
    }

    // 3. Chips de tipos de documento
    dom.chipsTipo.forEach(chip => {
      chip.addEventListener('click', () => {
        aplicarFiltroTipo(chip.dataset.tipo);
      });
    });

    // 4. Botón limpiar todo
    if (dom.btnLimpiarTodo) {
      dom.btnLimpiarTodo.addEventListener('click', limpiarTodosLosFiltros);
    }

    // 5. Botón quitar filtro de persona desde el banner
    if (dom.btnQuitarFiltroPersona) {
      dom.btnQuitarFiltroPersona.addEventListener('click', () => {
        aplicarFiltroPersona('todos');
      });
    }

    // 6. Eventos de cierre del modal
    if (dom.btnCerrarModal) {
      dom.btnCerrarModal.addEventListener('click', cerrarModalVisor);
    }
    if (dom.btnCerrarModalSecundario) {
      dom.btnCerrarModalSecundario.addEventListener('click', cerrarModalVisor);
    }

    // Cerrar al hacer clic en el fondo del modal (overlay)
    if (dom.modalVisor) {
      dom.modalVisor.addEventListener('click', (e) => {
        if (e.target === dom.modalVisor) {
          cerrarModalVisor();
        }
      });
    }

    // Cerrar con tecla Escape y atrapar foco
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.modalVisor && dom.modalVisor.classList.contains('active')) {
        cerrarModalVisor();
      }
    });
  }

})();
