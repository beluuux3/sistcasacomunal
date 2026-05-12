const fs = require('fs');

const file = 'src/app/(dashboard)/control-facilitadores/page.js';
let content = fs.readFileSync(file, 'utf8');

const oldPDFLogic = `  const casasDelFacilitador = getCasasByFacilitador(controlForm.facilitador_id);

  const openCreateControlModal = () => {
    setControlModalMode("create");
    const facilitatorId = selectedFacilitador || "";
    const casasAsignadas = getCasasByFacilitador(facilitatorId);
    const casaId = casasAsignadas[0]?.id ? String(casasAsignadas[0].id) : "";

    setControlForm({
      ...EMPTY_CONTROL_FORM,
      facilitador_id: facilitatorId,
      casa_comunal_id: casaId,
      fecha: selectedFecha || getTodayBolivia(),`;

const newPDFLogic = `  const casasDelFacilitador = getCasasByFacilitador(controlForm.facilitador_id);

  const handleGeneratePDF = () => {
    if (!selectedFacilitador) {
      alert("Debes seleccionar un facilitador para generar el reporte.");
      return;
    }

    const doc = new jsPDF();
    const facilitadorNombre = getNombreFacilitador(Number(selectedFacilitador));
    const mesNombre = MESES[filterMes - 1];

    doc.setFontSize(16);
    doc.text("Reporte Mensual de Control y Actividades", 14, 20);
    
    doc.setFontSize(11);
    doc.text(\`Facilitador: \${facilitadorNombre}\`, 14, 30);
    doc.text(\`Mes: \${mesNombre} \${filterAnio}\`, 14, 36);
    if (filterCasa) {
      const casaSelec = casas.find(c => c.id === Number(filterCasa));
      if (casaSelec) doc.text(\`Casa Comunal: \${casaSelec.nombre}\`, 14, 42);
    }

    // Calcular total de horas en el mes
    const totalMinutos = registrosCombinados.reduce((acc, reg) => {
      if (!reg.hora_entrada || !reg.hora_salida || reg.hora_entrada === "-" || reg.hora_salida === "-") return acc;
      const [hIni, mIni] = String(reg.hora_entrada).split(":").map(Number);
      const [hFin, mFin] = String(reg.hora_salida).split(":").map(Number);
      if (isNaN(hIni) || isNaN(mIni) || isNaN(hFin) || isNaN(mFin)) return acc;
      
      let diff = (hFin * 60 + mFin) - (hIni * 60 + mIni);
      if (diff < 0) diff += 24 * 60; // Por si cruza medianoche
      return acc + diff;
    }, 0);

    const horasTotal = Math.floor(totalMinutos / 60);
    const minutosTotal = totalMinutos % 60;
    doc.text(\`Total Horas Trabajadas: \${horasTotal}h \${minutosTotal}m\`, 14, filterCasa ? 48 : 42);

    const tableData = registrosCombinados.map(reg => [
      formatDate(reg.fecha),
      reg.tipo || "Asistencia a la casa comunal",
      formatTime(reg.hora_entrada),
      formatTime(reg.hora_salida),
      reg.descripcion || "-"
    ]);

    doc.autoTable({
      startY: filterCasa ? 55 : 49,
      head: [["Fecha", "Tipo de Actividad", "Llegada", "Salida", "Descripción"]],
      body: tableData,
    });

    doc.save(\`Reporte_\${facilitadorNombre.replace(/\\s+/g, "_")}_\${mesNombre}_\${filterAnio}.pdf\`);
  };

  const openCreateControlModal = () => {
    setControlModalMode("create");
    const facilitatorId = selectedFacilitador || "";
    const casasAsignadas = getCasasByFacilitador(facilitatorId);
    const casaId = casasAsignadas[0]?.id ? String(casasAsignadas[0].id) : "";

    setControlForm({
      ...EMPTY_CONTROL_FORM,
      facilitador_id: facilitatorId,
      casa_comunal_id: casaId,
      fecha: getTodayBolivia(),`;


const oldFilters = `      {/* Filtros */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Facilitador"
            value={selectedFacilitador}
            onChange={(e) => setSelectedFacilitador(e.target.value)}
          >
            <option value="">Todos los facilitadores</option>
            {facilitadores.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.nombre_completo || fac.nombre}
              </option>
            ))}
          </Select>

          <Input
            label="Fecha"
            type="date"
            value={selectedFecha}
            onChange={(e) => setSelectedFecha(e.target.value)}
          />

          <Select
            label="Estado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="validados">Validados</option>
            <option value="pendientes">Pendientes de validar</option>
          </Select>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFacilitador("");
                setSelectedFecha("");
                setFilterEstado("todos");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>`;

const newFilters = `      {/* Filtros */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Facilitador"
            value={selectedFacilitador}
            onChange={(e) => {
              setSelectedFacilitador(e.target.value);
              setFilterCasa(""); // Resetear casa si cambia facilitador
            }}
          >
            <option value="">Todos los facilitadores</option>
            {facilitadores.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.nombre_completo || fac.nombre}
              </option>
            ))}
          </Select>

          {selectedFacilitador && (
            <Select
              label="Casa Comunal"
              value={filterCasa}
              onChange={(e) => setFilterCasa(e.target.value)}
            >
              <option value="">Todas las casas</option>
              {getCasasByFacilitador(selectedFacilitador).map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </Select>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Select label="Mes" value={filterMes} onChange={(e) => setFilterMes(Number(e.target.value))}>
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </Select>
            </div>
            <div className="flex-1">
              <Select label="Año" value={filterAnio} onChange={(e) => setFilterAnio(Number(e.target.value))}>
                {anios.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </div>
          </div>

          <Select
            label="Estado (Controles)"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="validados">Validados</option>
            <option value="pendientes">Pendientes de validar</option>
          </Select>

          <div className="flex items-end gap-2 lg:col-span-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFacilitador("");
                setFilterMes(mesActual);
                setFilterAnio(anioActual);
                setFilterCasa("");
                setFilterEstado("todos");
              }}
            >
              Limpiar
            </Button>
            <Button
              variant="primary"
              onClick={handleGeneratePDF}
              className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none justify-center"
              disabled={!selectedFacilitador}
            >
              <Download size={18} className="mr-2" />
              Generar PDF Mensual
            </Button>
          </div>
        </div>
      </Card>`;

const oldTable = `      {/* Tabla de controles */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : filteredControles.length === 0 ? (
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">
            No hay registros de control para mostrar
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Facilitador
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    LLegada
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Salida
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Fotos
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((control) => (
                  <tr
                    key={control.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {getNombreFacilitador(control.facilitador_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(control.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-blue-600" />
                        {formatTime(control.hora_entrada)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        {control.hora_salida ? (
                          <>
                            <Clock size={14} className="text-green-600" />
                            {formatTime(control.hora_salida)}
                          </>
                        ) : (
                          <span className="text-yellow-600 text-xs font-medium">
                            En proceso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {control.latitud_entrada && control.longitud_entrada ? (
                        <a
                          href={\`https://maps.google.com/?q=\${control.latitud_entrada},\${control.longitud_entrada}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <MapPin size={14} />
                          <span className="text-xs">Ver mapa</span>
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedControl(control);
                          setShowFotosModal(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs font-medium"
                      >
                        <Eye size={14} />
                        Ver fotos
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {control.validado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          <AlertCircle size={12} />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => openEditControlModal(control)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium transition-colors"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        {!control.validado ? (
                          <button
                            onClick={() => {
                              setSelectedControl(control);
                              setValidationData({
                                validado: true,
                                observaciones: "",
                              });
                              setShowValidacionModal(true);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
                          >
                            Validar
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}`;

const newTable = `      {/* Tabla de controles */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : registrosCombinados.length === 0 ? (
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">
            No hay registros de control para mostrar
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Facilitador
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Tipo / Descripción
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    LLegada
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Salida
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Ubicación / Fotos
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {getNombreFacilitador(reg.facilitador_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(reg.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-700 text-xs">
                        {reg.tipo}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 truncate max-w-[200px]" title={reg.descripcion}>
                        {reg.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-blue-600" />
                        {formatTime(reg.hora_entrada)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        {reg.hora_salida ? (
                          <>
                            <Clock size={14} className="text-green-600" />
                            {formatTime(reg.hora_salida)}
                          </>
                        ) : (
                          <span className="text-yellow-600 text-xs font-medium">
                            En proceso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.source === "control" ? (
                        <div className="flex items-center gap-3">
                          {reg.latitud_entrada && reg.longitud_entrada ? (
                            <a
                              href={\`https://maps.google.com/?q=\${reg.latitud_entrada},\${reg.longitud_entrada}\`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                              title="Ver mapa"
                            >
                              <MapPin size={16} />
                            </a>
                          ) : (
                            <span className="text-gray-300"><MapPin size={16} /></span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedControl(reg.original);
                              setShowFotosModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Ver fotos"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.validado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          <AlertCircle size={12} />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.source === "control" ? (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => openEditControlModal(reg.original)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium transition-colors"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          {!reg.validado ? (
                            <button
                              onClick={() => {
                                setSelectedControl(reg.original);
                                setValidationData({
                                  validado: true,
                                  observaciones: "",
                                });
                                setShowValidacionModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
                            >
                              Validar
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Automático</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}`;

content = content.replace(oldPDFLogic, newPDFLogic);
content = content.replace(oldFilters, newFilters);
content = content.replace(oldTable, newTable);

fs.writeFileSync(file, content, 'utf8');
console.log('Reemplazo terminado.');
