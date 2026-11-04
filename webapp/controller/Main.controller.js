sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/m/Dialog",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ui/export/Spreadsheet"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    BusyIndicator,
    Dialog,
    Table,
    Column,
    ColumnListItem,
    Text,
    Button,
    SelectDialog,
    StandardListItem,
    Spreadsheet
) {
    "use strict";

    return Controller.extend(
        "listadoprestamo.listadoprestamo.controller.Main",
        {
            onInit: function () {
            // Crea el modelo local utilizado por la pantalla.
            var oLocalModel = new JSONModel({
                prestamos: [],
                componentes: [],
                ordenes: [],
                equipos: [],
                reservas: [],
                reservaSeleccionada: ""

            });

                // Registra el modelo local.
                this.getView().setModel(
                    oLocalModel,
                    "local"
                );
                this._sCampoOrdenActivo = "";
                this._sCampoEquipoActivo = "";
                this._sCampoReservaActivo = "";

                // Crea el modelo utilizado por el ComboBox de centros.
                var oCentrosModel = new JSONModel({
                    centros: []
                });

                // Registra el modelo de centros.
                this.getView().setModel(
                    oCentrosModel,
                    "centros"
                );

                // Crea el modelo utilizado por la ayuda de emplazamientos.
                var oEmplazamientosModel = new JSONModel({
                    todos: [],
                    filtrados: []
                });

                // Registra el modelo de emplazamientos.
                this.getView().setModel(
                    oEmplazamientosModel,
                    "emplazamientos"
                );

                // Obtiene el modelo OData principal.
                var oModel =
                    this.getOwnerComponent().getModel();

                // Valida que el modelo OData exista.
                if (!oModel) {
                    console.error(
                        "No se encontró el modelo OData principal"
                    );

                    MessageToast.show(
                        "No fue posible inicializar el servicio OData"
                    );

                    return;
                }

                // Espera a que la metadata del servicio esté disponible.
                oModel.metadataLoaded().then(
                    function () {
                        // Carga los centros.
                        this._cargarCentros();

                        // Carga los emplazamientos.
                        this._cargarEmplazamientos();
                    }.bind(this)
                ).catch(
                    function (oError) {
                        // Registra el error técnico.
                        console.error(
                            "Error cargando la metadata OData",
                            oError
                        );

                        // Informa el error al usuario.
                        MessageToast.show(
                            "No fue posible cargar la metadata del servicio"
                        );
                    }
                );
            },

            onReservaVHDesde: function () {

    this._sCampoReservaActivo =
        "inpReservaDesde";

    this._abrirAyudaReserva();

},

onMostrarFila: function (oEvent) {

    
console.log(
    "Status usuario:",
    oPrestamo.StatusUsuario
);

console.log(
    "Status sistema:",
    oPrestamo.StatusSistema
);


    var oContext =
        oEvent.getSource()
            .getBindingContext(
                "local"
            );

    if (!oContext) {
        return;
    }

    var oRegistro =
        oContext.getObject();

    console.log(
        "Fila seleccionada",
        oRegistro
    );

},

onReservaVHHasta: function () {

    this._sCampoReservaActivo =
        "inpReservaHasta";

    this._abrirAyudaReserva();

},
_abrirAyudaReserva: function () {

    // Obtiene el modelo OData.
    var oModel =
        this.getOwnerComponent().getModel();

    // Obtiene el modelo local.
    var oLocalModel =
        this.getView().getModel("local");

    // Muestra indicador de carga.
    BusyIndicator.show(0);

    // Consulta ReservaVHSet.
    oModel.read(
        "/ReservaVHSet",
        {

            success: function (oData) {

                BusyIndicator.hide();

                var aReservas =
                    oData && oData.results
                        ? oData.results
                        : [];

                aReservas = aReservas.map(
                    function (oReserva) {

                        return {

                            Reserva:
                                String(
                                    oReserva.Reserva || ""
                                ).replace(
                                    /^0+/,
                                    ""
                                ),

                            Descripcion:
                                oReserva.Descripcion || "",

                            Proyecto:
                                oReserva.Proyecto || "",

                            Centro:
                                oReserva.Centro || "",

                            Material:
                                oReserva.Material || "",

                            TextoMaterial:
                                oReserva.TextoMaterial || ""

                        };

                    }
                );

                oLocalModel.setProperty(
                    "/reservas",
                    aReservas
                );

                console.log(
                    "Reservas cargadas",
                    aReservas
                );

                this._mostrarDialogoReserva();

            }.bind(this),

            error: function (oError) {

                BusyIndicator.hide();

                console.error(
                    "Error ReservaVHSet",
                    oError
                );

                MessageToast.show(
                    "Error cargando ayuda de reservas"
                );

            }

        }
    );

},

_mostrarDialogoReserva: function () {

    if (!this._oReservaDialog) {

        this._oReservaDialog =
            new SelectDialog({

                title:
                    "Seleccionar reserva",

                noDataText:
                    "No se encontraron reservas",

                search: function (oEvent) {

                    var sBusqueda =
                        oEvent.getParameter(
                            "value"
                        );

                    var oBinding =
                        oEvent.getSource()
                            .getBinding("items");

                    var aFiltros = [];

                    if (sBusqueda) {

                        aFiltros.push(
                            new Filter({

                                filters: [

                                    new Filter(
                                        "Reserva",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    new Filter(
                                        "Descripcion",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    new Filter(
                                        "Material",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    )

                                ],

                                and: false

                            })
                        );

                    }

                    oBinding.filter(
                        aFiltros
                    );

                },

                confirm: function (oEvent) {

                    var oSelectedItem =
                        oEvent.getParameter(
                            "selectedItem"
                        );

                    if (!oSelectedItem) {
                        return;
                    }

                    var oContext =
                        oSelectedItem.getBindingContext(
                            "local"
                        );

                    if (!oContext) {
                        return;
                    }

                    var oReserva =
                        oContext.getObject();

                    var oCampoDestino =
                        this.byId(
                            this._sCampoReservaActivo
                        );

                    if (!oCampoDestino) {
                        return;
                    }

                    oCampoDestino.setValue(
                        oReserva.Reserva
                    );

                }.bind(this),

                items: {

                    path:
                        "local>/reservas",

                    template:
                        new StandardListItem({

title:
    "{local>Reserva}",

description:
    "{local>Descripcion}",

info:
    "{local>Centro} - {local>Material}",

                            type:
                                "Active"

                        })

                }

            });

        this.getView().addDependent(
            this._oReservaDialog
        );

    }

    this._oReservaDialog.setTitle(
        this._sCampoReservaActivo ===
            "inpReservaDesde"
            ? "Seleccionar Reserva Desde"
            : "Seleccionar Reserva Hasta"
    );

    this._oReservaDialog.open();

},

                        /**
             * Abre la ayuda de búsqueda para el campo Orden Desde.
             */
            onOrdenVHDesde: function () {

                // Guarda el ID del campo que recibirá la orden seleccionada.
                this._sCampoOrdenActivo =
                    "inpOrdenDesde";

                // Llama al método común que consulta y abre la ayuda.
                this._abrirAyudaOrden();

            },

            /**
             * Abre la ayuda de búsqueda para el campo Orden Hasta.
             */
            onOrdenVHHasta: function () {

                // Guarda el ID del campo que recibirá la orden seleccionada.
                this._sCampoOrdenActivo =
                    "inpOrdenHasta";

                // Llama al método común que consulta y abre la ayuda.
                this._abrirAyudaOrden();

            }, 

            onNieVHDesde: function () {

    this._sCampoEquipoActivo =
        "inpNieDesde";

    this._abrirAyudaEquipo();

},

onNieVHHasta: function () {

    this._sCampoEquipoActivo =
        "inpNieHasta";

    this._abrirAyudaEquipo();

},

_abrirAyudaEquipo: function () {

    var oModel =
        this.getOwnerComponent().getModel();

    var oLocalModel =
        this.getView().getModel("local");

    BusyIndicator.show(0);

    oModel.read(
        "/EquipoVHSet",
        {

            success: function (oData) {

                BusyIndicator.hide();

                var aEquipos =
                    oData && oData.results
                        ? oData.results
                        : [];

                aEquipos = aEquipos.map(
                    function (oEquipo) {

                        return {

                            Equipo:
                                String(
                                    oEquipo.Equipo || ""
                                ).replace(
                                    /^0+/,
                                    ""
                                ),

                            Descripcion:
                                oEquipo.Descripcion || "",

                            Centro:
                                oEquipo.Centro || "",

                            Emplazamiento:
                                oEquipo.Emplazamiento || "",

                            SerieFabricante:
                                oEquipo.SerieFabricante || ""

                        };

                    }
                );

                oLocalModel.setProperty(
                    "/equipos",
                    aEquipos
                );

                console.log(
                    "Equipos cargados",
                    aEquipos
                );

                this._mostrarDialogoEquipo();

            }.bind(this),

            error: function (oError) {

                BusyIndicator.hide();

                console.error(
                    "Error EquipoVHSet",
                    oError
                );

                MessageToast.show(
                    "Error cargando ayuda de NIE"
                );

            }

        }
    );

},

_mostrarDialogoEquipo: function () {

    if (!this._oEquipoDialog) {

        this._oEquipoDialog =
            new SelectDialog({

                title:
                    "Seleccionar NIE",

                noDataText:
                    "No se encontraron equipos",

                search: function (oEvent) {

                    var sBusqueda =
                        oEvent.getParameter(
                            "value"
                        );

                    var oBinding =
                        oEvent.getSource()
                            .getBinding(
                                "items"
                            );

                    var aFiltros = [];

                    if (sBusqueda) {

                        aFiltros.push(
                            new Filter({

                                filters: [

                                    new Filter(
                                        "Equipo",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    new Filter(
                                        "Descripcion",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    new Filter(
                                        "Centro",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    )

                                ],

                                and: false

                            })
                        );

                    }

                    oBinding.filter(
                        aFiltros
                    );

                },

                confirm: function (oEvent) {

                    var oSelectedItem =
                        oEvent.getParameter(
                            "selectedItem"
                        );

                    if (!oSelectedItem) {
                        return;
                    }

                    var oContext =
                        oSelectedItem.getBindingContext(
                            "local"
                        );

                    if (!oContext) {
                        return;
                    }

                    var oEquipo =
                        oContext.getObject();

                    var oCampoDestino =
                        this.byId(
                            this._sCampoEquipoActivo
                        );

                    oCampoDestino.setValue(
                        oEquipo.Equipo
                    );

                }.bind(this),

                items: {

                    path:
                        "local>/equipos",

                    template:
                        new StandardListItem({

                            title:
                                "{local>Equipo}",

                            description:
                                "{local>Descripcion}",

                            info:
                                "{local>Centro}",

                            type:
                                "Active"

                        })

                }

            });

        this.getView().addDependent(
            this._oEquipoDialog
        );

    }

    this._oEquipoDialog.setTitle(
        this._sCampoEquipoActivo ===
            "inpNieDesde"
            ? "Seleccionar NIE Desde"
            : "Seleccionar NIE Hasta"
    );

    this._oEquipoDialog.open();

},
            
_abrirAyudaOrden: function () {

    // Obtiene el modelo OData principal.
    var oModel =
        this.getOwnerComponent().getModel();

    // Obtiene el modelo local.
    var oLocalModel =
        this.getView().getModel("local");

    // Muestra indicador de carga.
    BusyIndicator.show(0);

    // Consulta la ayuda de órdenes.
    oModel.read(
        "/OrdenVHSet",
        {

            success: function (oData) {

                // Oculta indicador.
                BusyIndicator.hide();

var aOrdenes =
    oData && oData.results
        ? oData.results
        : [];

aOrdenes = aOrdenes.map(
    function (oOrden) {

        return {

            Orden:
                String(
                    oOrden.Orden || ""
                ).replace(
                    /^0+/,
                    ""
                ),

            TextoBreve:
                oOrden.TextoBreve || "",

            ClaseOrden:
                oOrden.ClaseOrden || "",

            FechaCreacion:
                oOrden.FechaCreacion || "",

            Centro:
                oOrden.Centro || "",

            Equipo:
                oOrden.Equipo || ""

        };

    }
);

oLocalModel.setProperty(
    "/ordenes",
    aOrdenes
);

                console.log(
                    "Ordenes cargadas",
                    oData.results
                );

                // Llama al diálogo.
                this._mostrarDialogoOrden();

            }.bind(this),

            error: function (oError) {

                BusyIndicator.hide();

                console.error(
                    "Error OrdenVHSet",
                    oError
                );

                MessageToast.show(
                    "Error cargando ayuda de órdenes"
                );

            }

        }
    );

},
_mostrarDialogoOrden: function () {

    // Crea el diálogo solamente durante la primera apertura.
    if (!this._oOrdenDialog) {

        // Construye el diálogo de selección de órdenes.
        this._oOrdenDialog =
            new SelectDialog({

                // Define el título inicial del diálogo.
                title:
                    "Seleccionar orden",

                // Define el mensaje mostrado cuando no existen coincidencias.
                noDataText:
                    "No se encontraron órdenes",

                // Procesa la búsqueda cuando el usuario presiona Buscar.
                search: function (oEvent) {

                    // Obtiene el texto escrito por el usuario.
                    var sBusqueda =
                        oEvent.getParameter(
                            "value"
                        );

                    // Obtiene el binding de los elementos del diálogo.
                    var oBinding =
                        oEvent.getSource()
                            .getBinding("items");

                    // Inicializa la lista de filtros.
                    var aFiltros = [];

                    // Solo crea filtros cuando existe texto de búsqueda.
                    if (sBusqueda) {

                        // Agrega un filtro compuesto con condición OR.
                        aFiltros.push(
                            new Filter({

                                // Define todos los campos disponibles para búsqueda.
                                filters: [

                                    // Busca por número de orden.
                                    new Filter(
                                        "Orden",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por texto breve o descripción.
                                    new Filter(
                                        "TextoBreve",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por clase de orden, por ejemplo ZCS1.
                                    new Filter(
                                        "ClaseOrden",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por fecha de creación.
                                    new Filter(
                                        "FechaCreacion",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    )

                                ],

                                // Indica que basta con cumplir uno de los filtros.
                                and: false

                            })
                        );

                    }

                    // Aplica los filtros a la lista del diálogo.
                    oBinding.filter(
                        aFiltros
                    );

                },

                // Procesa los cambios mientras el usuario escribe.
                liveChange: function (oEvent) {

                    // Obtiene el texto escrito.
                    var sBusqueda =
                        oEvent.getParameter(
                            "value"
                        );

                    // Obtiene el binding de la lista.
                    var oBinding =
                        oEvent.getSource()
                            .getBinding("items");

                    // Inicializa la colección de filtros.
                    var aFiltros = [];

                    // Crea los filtros cuando existe texto.
                    if (sBusqueda) {

                        // Agrega un filtro compuesto.
                        aFiltros.push(
                            new Filter({

                                // Define las propiedades sobre las que se buscará.
                                filters: [

                                    // Busca por número de orden.
                                    new Filter(
                                        "Orden",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por descripción.
                                    new Filter(
                                        "TextoBreve",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por clase de orden.
                                    new Filter(
                                        "ClaseOrden",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    ),

                                    // Busca por fecha.
                                    new Filter(
                                        "FechaCreacion",
                                        FilterOperator.Contains,
                                        sBusqueda
                                    )

                                ],

                                // Utiliza una condición OR.
                                and: false

                            })
                        );

                    }

                    // Aplica los filtros al listado.
                    oBinding.filter(
                        aFiltros
                    );

                },

                // Procesa la orden seleccionada.
                confirm: function (oEvent) {

                    // Obtiene el elemento seleccionado.
                    var oSelectedItem =
                        oEvent.getParameter(
                            "selectedItem"
                        );

                    // Finaliza cuando no existe selección.
                    if (!oSelectedItem) {
                        return;
                    }

                    // Obtiene el contexto del modelo local.
                    var oContext =
                        oSelectedItem.getBindingContext(
                            "local"
                        );

                    // Finaliza cuando no existe contexto.
                    if (!oContext) {
                        return;
                    }

                    // Recupera la orden seleccionada.
                    var oOrden =
                        oContext.getObject();

                    // Obtiene el campo Desde o Hasta que abrió la ayuda.
                    var oCampoDestino =
                        this.byId(
                            this._sCampoOrdenActivo
                        );

                    // Valida que el campo destino exista.
                    if (!oCampoDestino) {

                        // Registra el error técnico.
                        console.error(
                            "No se encontró el campo destino de la ayuda de Orden"
                        );

                        // Finaliza el método.
                        return;

                    }

oCampoDestino.setValue(
    String(
        oOrden.Orden
    ).replace(
        /^0+/,
        ""
    )
);

                    // Registra la selección para validación.
                    console.log(
                        "Orden seleccionada",
                        oOrden
                    );

                }.bind(this),

                // Procesa la cancelación del diálogo.
                cancel: function (oEvent) {

                    // Obtiene el binding de los elementos.
                    var oBinding =
                        oEvent.getSource()
                            .getBinding("items");

                    // Elimina filtros aplicados anteriormente.
                    if (oBinding) {
                        oBinding.filter([]);
                    }

                },

                // Define la colección utilizada por el diálogo.
                items: {

                    // Enlaza las órdenes almacenadas en el modelo local.
                    path:
                        "local>/ordenes",

                    // Define la representación visual de cada orden.
                    template:
                        new StandardListItem({

                            // Muestra el número de orden.
                            title:
                                "{local>Orden}",

                            // Muestra la descripción de la orden.
                            description:
                                "{local>TextoBreve}",

                            // Muestra la clase de orden a la derecha.
                            info:
                                "{local>ClaseOrden}",

                            // Permite seleccionar la fila.
                            type:
                                "Active"

                        })

                }

            });

        // Asocia el diálogo con la vista para heredar sus modelos.
        this.getView().addDependent(
            this._oOrdenDialog
        );

    }

    // Obtiene el binding existente del diálogo.
var oItemsBinding =
    this._oOrdenDialog.getBinding(
        "items"
    );

// Elimina filtros de una apertura anterior.
if (oItemsBinding) {

    oItemsBinding.filter([]);

}

// Define el título según el campo que abrió la ayuda.
this._oOrdenDialog.setTitle(
    this._sCampoOrdenActivo ===
        "inpOrdenDesde"
        ? "Seleccionar Orden Desde"
        : "Seleccionar Orden Hasta"
);

// Abre el diálogo.
this._oOrdenDialog.open();

},

            _cargarCentros: function () {
                // Obtiene el modelo OData principal.
                var oModel =
                    this.getOwnerComponent().getModel();

                // Obtiene el modelo JSON de centros.
                var oCentrosModel =
                    this.getView().getModel("centros");

                // Obtiene el ComboBox para controlar su estado ocupado.
                var oComboCentro =
                    this.byId("cmbCentro");

                // Activa el indicador de carga del ComboBox.
                if (oComboCentro) {
                    oComboCentro.setBusy(true);
                }

                // Consulta la entidad de ayuda de centros.
                oModel.read(
                    "/CentroVHSet",
                    {
                        success: function (oData) {
                            // Obtiene de forma segura los resultados.
                            var aCentros =
                                oData &&
                                Array.isArray(oData.results)
                                    ? oData.results
                                    : [];

                            // Normaliza los valores recibidos.
                            aCentros = aCentros.map(
                                function (oCentro) {
                                    return {
                                        Werks: String(
                                            oCentro.Werks || ""
                                        ).trim(),

                                        Name1: String(
                                            oCentro.Name1 || ""
                                        ).trim()
                                    };
                                }
                            );

                            // Conserva códigos numéricos de hasta cuatro posiciones.
                            aCentros = aCentros.filter(
                                function (oCentro) {
                                    return (
                                        oCentro.Werks !== "" &&
                                        /^\d{1,4}$/.test(
                                            oCentro.Werks
                                        )
                                    );
                                }
                            );

                            // Ordena los centros por su código numérico.
                            aCentros.sort(
                                function (oCentroA, oCentroB) {
                                    return (
                                        parseInt(
                                            oCentroA.Werks,
                                            10
                                        ) -
                                        parseInt(
                                            oCentroB.Werks,
                                            10
                                        )
                                    );
                                }
                            );

                            // Guarda los centros para alimentar el ComboBox.
                            oCentrosModel.setProperty(
                                "/centros",
                                aCentros
                            );

                            // Desactiva el indicador del ComboBox.
                            if (oComboCentro) {
                                oComboCentro.setBusy(false);
                            }

                            // Registra los datos para validar el resultado.
                            console.log(
                                "Centros cargados",
                                aCentros
                            );
                        },

                        error: function (oError) {
                            // Desactiva el indicador ante cualquier error.
                            if (oComboCentro) {
                                oComboCentro.setBusy(false);
                            }

                            // Registra el detalle técnico.
                            console.error(
                                "Error consultando CentroVHSet",
                                oError
                            );

                            // Informa el problema al usuario.
                            MessageToast.show(
                                "No fue posible cargar los centros"
                            );
                        }
                    }
                );
            },

            _cargarEmplazamientos: function () {
                // Obtiene el modelo OData principal.
                var oModel =
                    this.getOwnerComponent().getModel();

                // Obtiene el modelo de emplazamientos.
                var oEmplazamientosModel =
                    this.getView().getModel(
                        "emplazamientos"
                    );

                // Consulta la entidad de ayuda.
                oModel.read(
                    "/EmplazamientoVHSet",
                    {
                        success: function (oData) {
                            // Obtiene los resultados de forma segura.
                            var aEmplazamientos =
                                oData &&
                                Array.isArray(oData.results)
                                    ? oData.results
                                    : [];

                            // Normaliza los campos recibidos.
                            aEmplazamientos =
                                aEmplazamientos.map(
                                    function (oEmplazamiento) {
                                        return {
                                            Werks: String(
                                                oEmplazamiento.Werks || ""
                                            ).trim(),

                                            Stort: String(
                                                oEmplazamiento.Stort || ""
                                            ).trim(),

                                            Ktext: String(
                                                oEmplazamiento.Ktext || ""
                                            ).trim()
                                        };
                                    }
                                );

                            // Elimina registros sin emplazamiento.
                            aEmplazamientos =
                                aEmplazamientos.filter(
                                    function (oEmplazamiento) {
                                        return (
                                            oEmplazamiento.Stort !== ""
                                        );
                                    }
                                );

                            // Guarda el catálogo completo.
                            oEmplazamientosModel.setProperty(
                                "/todos",
                                aEmplazamientos
                            );

                            // Inicializa la colección filtrada.
                            oEmplazamientosModel.setProperty(
                                "/filtrados",
                                []
                            );

                            // Registra los datos cargados.
                            console.log(
                                "Emplazamientos cargados",
                                aEmplazamientos
                            );
                            console.log(
                                "Primer emplazamiento",
                                aEmplazamientos[0]
                            );
                        },

                        error: function (oError) {
                            // Registra el error técnico.
                            console.error(
                                "Error consultando EmplazamientoVHSet",
                                oError
                            );

                            // Informa el problema al usuario.
                            MessageToast.show(
                                "No fue posible cargar los emplazamientos"
                            );
                        }
                    }
                );
            },

            onCentroChange: function (oEvent) {
                // Obtiene el ComboBox que generó el evento.
                var oComboCentro =
                    oEvent.getSource();

                // Obtiene el código técnico del centro seleccionado.
                var sCentro =
                    oComboCentro.getSelectedKey();

                // Limpia el emplazamiento al cambiar el centro.
                this.byId(
                    "inpEmplazamiento"
                ).setValue("");

                // Actualiza los emplazamientos disponibles.
                this._filtrarEmplazamientosPorCentro();
                console.log(
    "Emplazamientos filtrados",
    this.getView()
        .getModel("emplazamientos")
        .getProperty("/filtrados")
);

                // Registra el código seleccionado.
                console.log(
                    "Código de centro seleccionado",
                    sCentro
                );
            },

            _filtrarEmplazamientosPorCentro: function () {

    // Obtiene el modelo de emplazamientos.
    var oEmplazamientosModel =
        this.getView().getModel(
            "emplazamientos"
        );

    // Obtiene todos los registros.
    var aTodos =
        oEmplazamientosModel.getProperty(
            "/todos"
        ) || [];

    // Conserva todos los emplazamientos.
    var aFiltrados =
        aTodos.filter(
            function (oEmplazamiento) {

                return (
                    oEmplazamiento &&
                    oEmplazamiento.Stort
                );

            }
        );

    // Ordena alfabéticamente.
    aFiltrados.sort(
        function (a, b) {

            return String(
                a.Stort || ""
            ).localeCompare(
                String(
                    b.Stort || ""
                )
            );

        }
    );

    // Actualiza el modelo.
    oEmplazamientosModel.setProperty(
        "/filtrados",
        aFiltrados
    );

    // Retorna resultados.
    return aFiltrados;

},

            onEmplazamientoVH: function () {
                // Obtiene el código del centro seleccionado.
                var sCentro =
                    this.byId(
                        "cmbCentro"
                    ).getSelectedKey();

                // Obtiene los emplazamientos del centro.
var aEmplazamientos =
    this._filtrarEmplazamientosPorCentro();

                // Valida que existan resultados.
                if (aEmplazamientos.length === 0) {
                    MessageToast.show(
                        "No se encontraron emplazamientos para el centro seleccionado"
                    );

                    return;
                }

                // Crea el diálogo solamente la primera vez.
                if (!this._oEmplazamientoDialog) {
                    this._oEmplazamientoDialog =
                        new SelectDialog({
                            title:
                                "Seleccionar emplazamiento",

                            noDataText:
                                "No se encontraron emplazamientos",

                            search: function (oEvent) {
                                // Obtiene el texto buscado.
                                var sBusqueda =
                                    oEvent.getParameter(
                                        "value"
                                    );

                                // Obtiene el binding de resultados.
                                var oBinding =
                                    oEvent.getSource()
                                        .getBinding("items");

                                // Inicializa los filtros.
                                var aFiltros = [];

                                // Filtra por código o descripción.
                                if (sBusqueda) {
                                    aFiltros.push(
                                        new Filter({
                                            filters: [
                                                new Filter(
                                                    "Stort",
                                                    FilterOperator.Contains,
                                                    sBusqueda
                                                ),
                                                new Filter(
                                                    "Ktext",
                                                    FilterOperator.Contains,
                                                    sBusqueda
                                                )
                                            ],
                                            and: false
                                        })
                                    );
                                }

                                // Aplica los filtros.
                                oBinding.filter(
                                    aFiltros
                                );
                            },

                            confirm: function (oEvent) {
                                // Obtiene el elemento elegido.
                                var oSelectedItem =
                                    oEvent.getParameter(
                                        "selectedItem"
                                    );

                                // Finaliza si no existe selección.
                                if (!oSelectedItem) {
                                    return;
                                }

                                // Obtiene el contexto del elemento.
                                var oContext =
                                    oSelectedItem.getBindingContext(
                                        "emplazamientos"
                                    );

                                // Finaliza si no existe contexto.
                                if (!oContext) {
                                    return;
                                }

                                // Obtiene el registro.
                                var oEmplazamiento =
                                    oContext.getObject();

                                // Asigna el código al campo.
// Coloca en el filtro el código del emplazamiento seleccionado.
this.byId(
    "inpEmplazamiento"
).setValue(
    oEmplazamiento.Werks
);
                            }.bind(this),

                            items: {
                                path:
                                    "emplazamientos>/filtrados",

template: new StandardListItem({

    // Muestra la descripción o ciudad como texto principal.
    title: "{emplazamientos>Stort}",

    // Muestra el código del emplazamiento a la derecha.
    info: "{emplazamientos>Werks}",

    // Permite seleccionar el registro.
    type: "Active"

})
                            }
                        });

                    // Asocia el diálogo con la vista.
                    this.getView().addDependent(
                        this._oEmplazamientoDialog
                    );
                }

                // Actualiza el título con el código del centro.
                this._oEmplazamientoDialog.setTitle(
                    "Emplazamientos del centro " +
                    sCentro
                );

                // Abre la ayuda.
                this._oEmplazamientoDialog.open();
            },

            onLimpiar: function () {
                // Limpia todos los filtros.
                this.byId("inpOrdenDesde").setValue("");
                this.byId("inpOrdenHasta").setValue("");
                this.byId("inpNieDesde").setValue("");
                this.byId("inpNieHasta").setValue("");
                this.byId("inpReservaDesde").setValue("");
                this.byId("inpReservaHasta").setValue("");
                this.byId("dpFechaDesde").setValue("");
                this.byId("dpFechaHasta").setValue("");
                this.byId("cmbCentro").setSelectedKey("");
                this.byId("cmbCentro").setValue("");
                this.byId("inpEmplazamiento").setValue("");

                // Limpia los resultados principales.
                this.getView()
                    .getModel("local")
                    .setProperty(
                        "/prestamos",
                        []
                    );

                // Limpia los emplazamientos filtrados.
                this.getView()
                    .getModel("emplazamientos")
                    .setProperty(
                        "/filtrados",
                        []
                    );
            },

            onBuscar: function () {
                // Obtiene los modelos.
                var oModel =
                    this.getOwnerComponent().getModel();

                var oLocalModel =
                    this.getView().getModel("local");

                // Inicializa los filtros.
                var aFilters = [];

                // Obtiene los valores de pantalla.
                var sOrdenDesde =
                    this.byId("inpOrdenDesde").getValue();

                var sOrdenHasta =
                    this.byId("inpOrdenHasta").getValue();

                var sReservaDesde =
                    this.byId("inpReservaDesde").getValue();

                var sReservaHasta =
                    this.byId("inpReservaHasta").getValue();

                var sNieDesde =
                    this.byId("inpNieDesde").getValue();

                var sNieHasta =
                    this.byId("inpNieHasta").getValue();

                var sCentro =
                    this.byId("cmbCentro").getSelectedKey();

                var sEmplazamiento =
                    this.byId(
                        "inpEmplazamiento"
                    ).getValue();

                var sFechaDesde =
                    this.byId("dpFechaDesde").getValue();

                var sFechaHasta =
                    this.byId("dpFechaHasta").getValue();

                // Construye el filtro de Orden.
                if (sOrdenDesde && sOrdenHasta) {
                    aFilters.push(
                        new Filter(
                            "Orden",
                            FilterOperator.BT,
                            sOrdenDesde,
                            sOrdenHasta
                        )
                    );
                } else if (sOrdenDesde) {
                    aFilters.push(
                        new Filter(
                            "Orden",
                            FilterOperator.EQ,
                            sOrdenDesde
                        )
                    );
                }

                // Construye el filtro de Reserva.
                if (sReservaDesde && sReservaHasta) {
                    aFilters.push(
                        new Filter(
                            "Reserva",
                            FilterOperator.BT,
                            sReservaDesde,
                            sReservaHasta
                        )
                    );
                } else if (sReservaDesde) {
                    aFilters.push(
                        new Filter(
                            "Reserva",
                            FilterOperator.EQ,
                            sReservaDesde
                        )
                    );
                }

                // Construye el filtro de NIE.
                if (sNieDesde && sNieHasta) {
                    aFilters.push(
                        new Filter(
                            "Equipo",
                            FilterOperator.BT,
                            sNieDesde,
                            sNieHasta
                        )
                    );
                } else if (sNieDesde) {
                    aFilters.push(
                        new Filter(
                            "Equipo",
                            FilterOperator.EQ,
                            sNieDesde
                        )
                    );
                }

                // Construye el filtro de Centro con el código.
                if (sCentro) {
                    aFilters.push(
                        new Filter(
                            "Centro",
                            FilterOperator.EQ,
                            sCentro
                        )
                    );
                }

                // Construye el filtro de Emplazamiento.
                if (sEmplazamiento) {
                    aFilters.push(
                        new Filter(
                            "Emplazamiento",
                            FilterOperator.EQ,
                            sEmplazamiento
                        )
                    );
                }

                // Construye el rango de fechas.
                if (sFechaDesde && sFechaHasta) {
                    aFilters.push(
                        new Filter(
                            "CreadoEl",
                            FilterOperator.BT,
                            sFechaDesde,
                            sFechaHasta
                        )
                    );
                }

                // Valida que exista un criterio.
                if (aFilters.length === 0) {
                    MessageToast.show(
                        "Ingrese al menos un filtro"
                    );

                    return;
                }

                // Muestra el indicador de carga.
                BusyIndicator.show(0);

                // Consulta los préstamos.
                oModel.read(
                    "/PrestamoSet",
                    {
                        filters: aFilters,

                        success: function (oData) {
                            // Oculta el indicador.
                            BusyIndicator.hide();

                            // Obtiene los resultados.
                            var aPrestamos =
                                oData &&
                                Array.isArray(oData.results)
                                    ? oData.results
                                    : [];
                                    aPrestamos = aPrestamos.map(
    function (oPrestamo) {

        // Inicializa el color por defecto.
        oPrestamo.RowHighlight =
            "None";

        // Marca las órdenes cerradas.
        if (
            oPrestamo.StatusSistema &&
            oPrestamo.StatusSistema.indexOf(
                "CERR"
            ) >= 0
        ) {

            oPrestamo.RowHighlight =
                "Error";

        }

        return oPrestamo;

    }
);

                            // Actualiza la tabla.
                            oLocalModel.setProperty(
                                "/prestamos",
                                aPrestamos
                            );

                            console.log(
    "Primer prestamo",
    aPrestamos[0]
);

                            // Informa la cantidad encontrada.
                            MessageToast.show(
                                aPrestamos.length +
                                " registro(s) encontrado(s)"
                            );
                        },

                        error: function (oError) {
                            // Oculta el indicador.
                            BusyIndicator.hide();

                            // Registra el error.
                            console.error(
                                "Error consultando PrestamoSet",
                                oError
                            );

                            // Informa el problema.
                            MessageToast.show(
                                "Error consultando préstamos"
                            );
                        }
                    }
                );
            },

            onCambiarVista: function () {
                // Método reservado para configuración posterior.
            },

            onConfigColumnas: function () {
                // Informa funcionalidad pendiente.
                MessageToast.show(
                    "Funcionalidad pendiente"
                );
            },

onExportarExcel: function () {

    // Obtiene los registros actualmente cargados en la tabla.
    var aDatos =
        this.getView()
            .getModel("local")
            .getProperty(
                "/prestamos"
            ) || [];

    // Valida que existan registros para exportar.
    if (aDatos.length === 0) {

        MessageToast.show(
            "No existen registros para exportar"
        );

        return;

    }

    // Define las columnas del archivo Excel.
    var aColumnas = [

        {
            label: "Orden",
            property: "Orden"
        },

        {
            label: "Reserva",
            property: "Reserva"
        },

        {
            label: "Pedido Cliente",
            property: "PedClte"
        },

        {
            label: "AMa",
            property: "Ama"
        },

        {
            label: "Denominación objeto técnico",
            property: "DenomObjTecnico"
        },

        {
            label: "Denominación",
            property: "Denominacion"
        },

        {
            label: "Status sistema",
            property: "StatusSistema"
        },

        {
            label: "Equipo",
            property: "Equipo"
        },

        {
            label: "Centro",
            property: "Centro"
        },

        {
            label: "Serie fabricante",
            property: "NumeroSerieFabricante"
        },

        {
            label: "Puesto de trabajo",
            property: "PtoTrbRes"
        },

        {
            label: "Costo",
            property: "SumCosReal"
        },

        {
            label: "Creado el",
            property: "CreadoEl"
        },

        {
            label: "Status usuario",
            property: "StatusUsuario"
        },

        {
            label: "Emplazamiento",
            property: "Emplazamiento"
        }

    ];

    // Configuración del documento Excel.
    var oSettings = {

        workbook: {

            columns: aColumnas

        },

        dataSource: aDatos,

        fileName:
            "Listado_Prestamos.xlsx"

    };

    // Crea el objeto Spreadsheet.
    var oSpreadsheet =
        new Spreadsheet(
            oSettings
        );

    // Genera y descarga el archivo.
    oSpreadsheet.build()
        .then(
            function () {

                MessageToast.show(
                    "Excel generado correctamente"
                );

            }
        )
        .finally(
            function () {

                oSpreadsheet.destroy();

            }
        );

},
            onPrestamoPress: function (oEvent) {
                // Obtiene la fila seleccionada.
                var oListItem =
                    oEvent.getParameter("listItem");

                // Valida la fila.
                if (!oListItem) {
                    return;
                }

                // Obtiene el contexto.
                var oContext =
                    oListItem.getBindingContext("local");

                // Valida el contexto.
                if (!oContext) {
                    return;
                }

                // Obtiene el préstamo.
                var oPrestamo =
                    oContext.getObject();
                    console.log(
    "Fila seleccionada",
    oPrestamo
);

                // Obtiene la reserva.
                var sReserva =
                    oPrestamo.Reserva;

                // Valida la reserva.
                if (!sReserva) {
                    MessageToast.show(
                        "El registro seleccionado no tiene reserva"
                    );

                    return;
                }

                // Obtiene los modelos.
                var oModel =
                    this.getOwnerComponent().getModel();

                var oLocalModel =
                    this.getView().getModel("local");

                // Limpia los componentes anteriores.
                oLocalModel.setProperty(
                    "/componentes",
                    []
                );

                // Muestra el indicador de carga.
                BusyIndicator.show(0);

                // Consulta los componentes.
                oModel.read(
                    "/ComponenteSet",
                    {
                        filters: [
                            new Filter(
                                "Reserva",
                                FilterOperator.EQ,
                                sReserva
                            )
                        ],

                        success: function (oData) {
                            // Oculta el indicador.
                            BusyIndicator.hide();

                            // Obtiene los componentes.
                            var aComponentes =
                                oData &&
                                Array.isArray(oData.results)
                                    ? oData.results
                                    : [];

                            // Actualiza el modelo.
                            oLocalModel.setProperty(
                                "/componentes",
                                aComponentes
                            );

                            // Crea el diálogo cuando no existe.
                            if (!this._oComponentesDialog) {
                                // Crea la tabla del diálogo.
                                var oTablaComponentes =
                                    new Table({
                                        items: {
                                            path:
                                                "local>/componentes",

                                            template:
                                                new ColumnListItem({
                                                    cells: [
                                                        new Text({
                                                            text:
                                                                "{local>Posicion}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>Material}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>Centro}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>CantidadNecesaria}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>Unidad}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>CantidadTomada}"
                                                        }),
                                                        new Text({
                                                            text:
                                                                "{local>TextoMaterial}"
                                                        })
                                                    ]
                                                })
                                        },

                                        noDataText:
                                            "No se encontraron componentes para la reserva",

                                        columns: [
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Posición"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Material"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Centro"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Cantidad necesaria"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Unidad"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Cantidad tomada"
                                                    })
                                            }),
                                            new Column({
                                                header:
                                                    new Text({
                                                        text:
                                                            "Texto material"
                                                    })
                                            })
                                        ]
                                    });

                                // Crea el diálogo.
                                this._oComponentesDialog =
                                    new Dialog({
                                        title:
                                            "Componentes de la reserva",

                                        contentWidth:
                                            "70rem",

                                        contentHeight:
                                            "30rem",

                                        resizable: true,

                                        draggable: true,

                                        content: [
                                            oTablaComponentes
                                        ],

                                        endButton:
                                            new Button({
                                                text: "Cerrar",

                                                press:
                                                    function () {
                                                        this._oComponentesDialog.close();
                                                    }.bind(this)
                                            })
                                    });

                                // Asocia el diálogo a la vista.
                                this.getView().addDependent(
                                    this._oComponentesDialog
                                );
                            }

                            // Actualiza el título.
                            this._oComponentesDialog.setTitle(
                                "Componentes de la reserva " +
                                sReserva
                            );

                            // Abre el diálogo.
                            this._oComponentesDialog.open();

                            // Informa la cantidad encontrada.
                            MessageToast.show(
                                aComponentes.length +
                                " componente(s) encontrado(s)"
                            );
                        }.bind(this),

                        error: function (oError) {
                            // Oculta el indicador.
                            BusyIndicator.hide();

                            // Registra el error.
                            console.error(
                                "Error consultando ComponenteSet",
                                oError
                            );

                            // Informa el problema.
                            MessageToast.show(
                                "Error consultando los componentes de la reserva"
                            );
                        }
                    }
                );
            }
        }
    );
});