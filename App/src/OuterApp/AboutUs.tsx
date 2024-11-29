import React, { useEffect, useState } from 'react';

interface MatrixProps {
  matrixWidth: number;
  matrixHeight: number;
}

const SvgCoordinateMapper: React.FC<MatrixProps> = ({ matrixWidth, matrixHeight }) => {
  // Kezdeti mátrix létrehozása
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill(0))
  );

  useEffect(() => {
    // SVG elem kinyerése
    const svgElement = document.querySelector('svg');

    if (svgElement) {
      const newMatrix = Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill(0));

      // Kiválasztjuk az összes circle elemet és lekérdezzük a koordinátákat
      const circles = svgElement.querySelectorAll('circle');
      circles.forEach((circle) => {
        const cx = parseInt(circle.getAttribute('cx') || '0', 10);
        const cy = parseInt(circle.getAttribute('cy') || '0', 10);

        // A koordinátákat beállítjuk a mátrix megfelelő cellájában
        if (cx >= 0 && cx < matrixWidth && cy >= 0 && cy < matrixHeight) {
          newMatrix[cy][cx] = 1; // 1 jelezheti, hogy van kör ezen a koordinátán
        }
      });

      // Kiválasztjuk az összes rect elemet és lekérdezzük a koordinátákat
      const rects = svgElement.querySelectorAll('rect');
      rects.forEach((rect) => {
        const x = parseInt(rect.getAttribute('x') || '0', 10);
        const y = parseInt(rect.getAttribute('y') || '0', 10);
        const width = parseInt(rect.getAttribute('width') || '0', 10);
        const height = parseInt(rect.getAttribute('height') || '0', 10);

        // A téglalap területét bejárva beállítjuk a mátrix értékeit
        for (let i = x; i < x + width; i++) {
          for (let j = y; j < y + height; j++) {
            if (i >= 0 && i < matrixWidth && j >= 0 && j < matrixHeight) {
              newMatrix[j][i] = 1; // 1 jelezheti, hogy van téglalap ezen a koordinátán
            }
          }
        }
      });

      // Beállítjuk az új mátrixot
      setMatrix(newMatrix);

      // Konzolon kiírjuk a mátrixot
      console.log('Frissített mátrix:', newMatrix);
    }
  }, [matrixWidth, matrixHeight]);

  return (
    <div>
      <svg width="200" height="200">
        <circle cx="50" cy="50" r="10" fill="blue" />
        <rect x="100" y="100" width="20" height="20" fill="red" />
      </svg>

      <h2>SVG Koordináták Mátrixa</h2>
      <pre>{JSON.stringify(matrix, null, 2)}</pre>
    </div>
  );
};

export default SvgCoordinateMapper;
