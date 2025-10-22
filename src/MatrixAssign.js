import React, { useState } from "react";
import axios from "axios";
import MatrixChart from "./MatrixChart";
import "./MatrixAssign.css";

const MatrixAssign = () => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrix, setMatrix] = useState([]);
  const [matrixSet, setMatrixSet] = useState(false);
  const [result, setResult] = useState(null);
  const [reducedMatrix, setReducedMatrix] = useState([]);
  const [rowLabels, setRowLabels] = useState([]);
  const [colLabels, setColLabels] = useState([]);
  const [assignType, setAssignType] = useState("min");

  const createMatrix = (r, c) =>
    Array.from({ length: r }, () => Array.from({ length: c }, () => ""));

  const createLabels = (length) => Array.from({ length }, () => "");

  const handleSetMatrix = () => {
    setMatrix(createMatrix(rows, cols));
    setRowLabels(createLabels(rows));
    setColLabels(createLabels(cols));
    setMatrixSet(true);
    setResult(null);
    setReducedMatrix([]);
  };

  const handleReset = () => {
    setMatrix([]);
    setRowLabels([]);
    setColLabels([]);
    setMatrixSet(false);
    setResult(null);
    setReducedMatrix([]);
    setAssignType("min");
  };

 const handleChangeValue = (i, j, value) => {
  const cleanValue = value.replace(/[^\d.]/g, "");
  const num = parseFloat(cleanValue) || 0;

  const newMatrix = matrix.map((row, rowIndex) =>
    row.map((val, colIndex) =>
      rowIndex === i && colIndex === j ? num : val
    )
  );
  setMatrix(newMatrix);
};


  const handleChangeRowLabel = (index, value) => {
    const newLabels = [...rowLabels];
    newLabels[index] = value;
    setRowLabels(newLabels);
  };

  const handleChangeColLabel = (index, value) => {
    const newLabels = [...colLabels];
    newLabels[index] = value;
    setColLabels(newLabels);
  };

  const makeSquareMatrix = (original) => {
    if (!original || original.length === 0) return [[]];

    const rowCount = original.length;
    const colCount = original[0]?.length || 0;
    const size = Math.max(rowCount, colCount);

    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) =>
        i < rowCount && j < colCount ? original[i][j] : 0
      )
    );
  };

  const reduceMatrix = (mat) => {
    const rowReduced = mat.map((row) => {
      const minRow = Math.min(...row);
      return row.map((val) => val - minRow);
    });

    const size = rowReduced.length;
    const colMins = [];
    for (let j = 0; j < size; j++) {
      let colVals = [];
      for (let i = 0; i < size; i++) {
        colVals.push(rowReduced[i][j]);
      }
      colMins.push(Math.min(...colVals));
    }

    return rowReduced.map((row) => row.map((val, j) => val - colMins[j]));
  };

  const handleCalculate = async () => {
    try {
      const currentMatrix = matrix.map((row) =>
        row.map((val) => Math.max(0, parseFloat(val) || 0))
      );

      if (
        currentMatrix.length === 0 ||
        currentMatrix.some((row) => row.length !== currentMatrix[0].length)
      ) {
        alert("La matriz no es válida. Verifica los datos.");
        return;
      }

      const squareMatrix = makeSquareMatrix(currentMatrix);
      const reduced = reduceMatrix(squareMatrix);
      setReducedMatrix(reduced);

      const res = await axios.post(
        "https://hungarobackendr.onrender.com/hungarian",
        {
          costMatrix: currentMatrix,
          assignType,
        }
      );

      setMatrix(currentMatrix);
      setReducedMatrix(res.data.reducedMatrix);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error || "Error calculando la asignación";
      alert(message);
    }
  };

  const generateAssignmentText = (
    assignments,
    matrix,
    rowLabels = [],
    colLabels = []
  ) => {
    if (
      !assignments ||
      assignments.length === 0 ||
      !matrix ||
      matrix.length === 0
    ) {
      return [];
    }

    return assignments
      .map((colIndex, rowIndex) => {
        if (colIndex === null || colIndex === undefined || !matrix[rowIndex])
          return null;

        const empleado =
          rowLabels[rowIndex]?.trim() || `Empleado ${rowIndex + 1}`;
        const trabajo =
          colLabels[colIndex]?.trim() || `Trabajo ${colIndex + 1}`;
        const costo = matrix[rowIndex]?.[colIndex] ?? 0;

        return `${empleado} va a trabajar como ${trabajo}, cobrando Q${costo}`;
      })
      .filter(Boolean);
  };

  const getTotalCost = (assignments, originalMatrix) => {
    if (!assignments) return 0;

    return assignments.reduce((sum, colIndex, rowIndex) => {
      return sum + (originalMatrix[rowIndex]?.[colIndex] || 0);
    }, 0);
  };

  const renderMatrix = (matrix, assignments = null, readOnly = false) => (
    <table className="matrix-table">
      <thead>
        <tr>
          <th></th>
          {colLabels.map((label, j) => (
            <th key={j}>
              <input
                type="text"
                value={label}
                placeholder={`Col ${j + 1}`}
                onChange={(e) => handleChangeColLabel(j, e.target.value)}
                disabled={readOnly || assignments !== null}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <th>
              <input
                type="text"
                value={rowLabels[i]}
                placeholder={`Fila ${i + 1}`}
                onChange={(e) => handleChangeRowLabel(i, e.target.value)}
                disabled={readOnly || assignments !== null}
              />
            </th>
            {row.map((val, j) => (
              <td key={j}>
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    readOnly || assignments
                      ? null
                      : handleChangeValue(i, j, e.target.value)
                  }
                  className={
                    assignments && assignments[i] === j ? "assigned" : ""
                  }
                  disabled={readOnly || assignments !== null}
                  style={{
                    backgroundColor:
                      assignments && assignments[i] === j
                        ? "lightgreen"
                        : "inherit",
                  }}
                  inputMode="decimal"
                  pattern="[0-9]*"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container">
      <h1>Algoritmo Húngaro</h1>

      {!matrixSet && (
        <div className="controls">
       <label>
  Filas:
  <input
    type="text"
    inputMode="decimal"
    pattern="[0-9]*"
    value={rows}
    placeholder="Ej. 2"
    onChange={(e) => {
      const clean = e.target.value.replace(/[^\d]/g, "");
      setRows(clean === "" ? "" : parseInt(clean));
    }}
  />
</label>

          <label>
  Columnas:
  <input
    type="text"
    inputMode="decimal"
    pattern="[0-9]*"
    value={cols}
    placeholder="Ej. 2"
    onChange={(e) => {
      const clean = e.target.value.replace(/[^\d]/g, "");
      setCols(clean === "" ? "" : parseInt(clean));
    }}
  />
</label>
          <button onClick={handleSetMatrix}>Establecer matriz</button>
        </div>
      )}

      {matrixSet && (
        <>
          {renderMatrix(matrix)}

          <div className="assign-type">
            <label>
              <input
                type="radio"
                name="assignType"
                value="min"
                checked={assignType === "min"}
                onChange={() => setAssignType("min")}
              />
              Asignación mínima
            </label>
            <label style={{ marginLeft: "20px" }}>
              <input
                type="radio"
                name="assignType"
                value="max"
                checked={assignType === "max"}
                onChange={() => setAssignType("max")}
              />
              Asignación máxima
            </label>
          </div>

          <div className="button-group">
            <button onClick={handleCalculate}>Calcular asignación</button>
            <button onClick={handleReset}>Reiniciar</button>
          </div>
        </>
      )}

      {reducedMatrix.length > 0 && (
        <div>
          <h2>Matriz reducida</h2>
          {renderMatrix(
            reducedMatrix,
            result
              ? assignType === "min"
                ? result.minResult?.assignments
                : result.maxResult?.assignments
              : null,
            true
          )}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          {assignType === "min" && result.minResult && (
            <>
              <h2>
                Asignación mínima (Costo mínimo: Q
                {getTotalCost(result.minResult.assignments, matrix)})
              </h2>

              {renderMatrix(matrix, result.minResult.assignments)}
              <MatrixChart
                assignments={result.minResult.assignments}
                matrix={matrix}
                rowLabels={rowLabels}
              />
              <div className="assignment-text">
                <h3>Detalle de asignaciones:</h3>
                <ul>
                  {generateAssignmentText(
                    result.minResult.assignments,
                    matrix,
                    rowLabels,
                    colLabels
                  ).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                  Total: Q{getTotalCost(result.minResult.assignments, matrix)}
                </p>
              </div>
            </>
          )}

          {assignType === "max" && result.maxResult && (
            <>
              <h2>
                Asignación máxima (Suma máxima: Q
                {getTotalCost(result.maxResult.assignments, matrix)})
              </h2>

              {renderMatrix(matrix, result.maxResult.assignments)}
              <MatrixChart
                assignments={result.maxResult.assignments}
                matrix={matrix}
                rowLabels={rowLabels}
              />

              <div className="assignment-text">
                <h3>Detalle de asignaciones:</h3>
                <ul>
                  {generateAssignmentText(
                    result.maxResult.assignments,
                    matrix,
                    rowLabels,
                    colLabels
                  ).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                  Total: Q{getTotalCost(result.maxResult.assignments, matrix)}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MatrixAssign;
