/* eslint-disable @typescript-eslint/no-var-requires */
const XLSX = require('xlsx'); // Импорт библиотеки
const fs = require('fs'); // Импорт библиотеки для работы с файловой системой

// Функция для чтения XLSX файла
function parseXlsxFile(filePath) {
  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    throw new Error(`Файл ${filePath} не найден.`);
  }

  try {
    // Читаем файл
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Берём первую вкладку
    const sheet = workbook.Sheets[sheetName];

    // Преобразуем sheet в JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Проверяем, что данные не пустые и содержат заголовки
    if (jsonData.length === 0 || !Array.isArray(jsonData[0])) {
      throw new Error('Файл не содержит данных или заголовков.');
    }

    // Получаем заголовки
    const headers = jsonData[0];

    // Создаём массив для результатов
    const result = [];

    // Заполняем массив объектами, где ключи — это заголовки, а значения — это соответствующие значения из строки
    jsonData.slice(1).forEach((row) => {
      if (row.length !== headers.length) {
        throw new Error(
          'Количество столбцов в строке не соответствует количеству заголовков.',
        );
      }
      const rowObject = {};
      row.forEach((cell, index) => {
        rowObject[headers[index]] = cell;
      });
      result.push(rowObject);
    });

    return result;
  } catch (error) {
    throw new Error(`Ошибка при чтении файла: ${error.message}`);
  }
}

// Пример использования
const filePath = './food.xlsx';
try {
  const parsedData = parseXlsxFile(filePath);
  console.log(parsedData);
} catch (error) {
  console.error(error.message);
}
