/* eslint-disable @typescript-eslint/no-var-requires */
const XLSX = require('xlsx');
const fs = require('fs');

// Destructure writeFileSync
const { writeFileSync } = fs;

function generateDescription(name, category) {
  if (!name || !category) {
    return 'Описание недоступно'; // Возвращаем заглушку, если имя или категория не переданы
  }

  const baseDescriptions = {
    coffee: [
      `Ароматный ${name}, который подарит вам заряд бодрости и наслаждения.`,
      `Классический ${name}, идеальный выбор для настоящих ценителей кофе.`,
      `Попробуйте наш ${name}, созданный из отборных кофейных зерен.`,
    ],
    tea: [
      `Нежный и успокаивающий ${name}, который согреет вас в любое время дня.`,
      `Погрузитесь в атмосферу уюта с нашим ${name}.`,
      `${name} — идеальный напиток для тех, кто ценит традиции.`,
    ],
    coldDrinks: [
      `${name} — освежающий напиток, который поможет вам взбодриться в жаркий день.`,
      `Попробуйте ${name}, чтобы зарядиться энергией и насладиться вкусом.`,
      `${name} — идеальный выбор для тех, кто любит освежающие напитки.`,
    ],
    bakery: [
      `Нежный и ароматный ${name}, который растопит ваше сердце.`,
      `Попробуйте наш свежий ${name}, приготовленный с любовью.`,
      `${name} — сладкое удовольствие, которому невозможно сопротивляться.`,
    ],
    mainDishes: [
      `Сытное и вкусное блюдо — ${name}, которое утолит ваш голод.`,
      `Попробуйте ${name}, чтобы получить максимум удовольствия от еды.`,
      `${name} — отличный выбор для полноценного приёма пищи.`,
    ],
    other: [
      `Уникальное блюдо — ${name}, которое удивит вас своим вкусом.`,
      `Необычный ${name}, который стоит попробовать каждому.`,
      `${name} — что-то особенное в нашем меню.`,
    ],
  };

  const descriptions = baseDescriptions[category] || baseDescriptions.other;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

const categories = {
  coffee: {
    name: 'Кофе',
    description:
      'Насладитесь насыщенным вкусом и ароматом наших кофейных напитков. От классического эспрессо до нежного латте — каждый глоток подарит вам заряд бодрости и удовольствия.',
    icon: '/icons/coffee.png',
  },
  tea: {
    name: 'Чай',
    description:
      'Погрузитесь в мир уюта и гармонии с нашими чайными композициями. От традиционного чёрного чая до изысканного зелёного — каждый напиток создан для того, чтобы согреть вашу душу.',
    icon: '/icons/tea.png',
  },
  coldDrinks: {
    name: 'Прохладительные напитки',
    description:
      'Освежитесь в жаркий день с нашими прохладительными напитками. Лимонады, смузи, холодные чаи и многое другое — идеальный выбор для тех, кто ценит свежесть и вкус.',
    icon: '/icons/cold-drinks.png',
  },
  bakery: {
    name: 'Выпечка',
    description:
      'Попробуйте нашу свежую выпечку и десерты, которые подарят вам настоящее наслаждение. Ароматные круассаны, нежные пирожные и аппетитные торты — каждый десерт создан с любовью.',
    icon: '/icons/bakery.png',
  },
  mainDishes: {
    name: 'Основные блюда',
    description:
      'Сытные и вкусные блюда для полноценного приёма пищи. От сытных салатов до аппетитных сэндвичей — мы предлагаем только лучшее для вашего стола.',
    icon: '/icons/main-dishes.png',
  },
  other: {
    name: 'Другое',
    description:
      'Здесь вы найдёте всё, что не вошло в основные категории. Уникальные товары, которые могут вас удивить и порадовать.',
    icon: '/icons/other.png',
  },
};

function getCategory(place) {
  if (place.includes('Кофе')) {
    return categories.coffee;
  } else if (place.includes('Чай')) {
    return categories.tea;
  } else if (
    place.includes('Лимонад') ||
    place.includes('Смузи') ||
    place.includes('Айс')
  ) {
    return categories.coldDrinks;
  } else if (place.includes('Выпечка') || place.includes('Десерты')) {
    return categories.bakery;
  } else if (
    place.includes('Основные блюда') ||
    place.includes('Салаты') ||
    place.includes('Сэндвичи')
  ) {
    return categories.mainDishes;
  } else {
    return categories.other;
  }
}

function extractSizeFromName(name) {
  const sizePattern = /(?:\s|^)(M|L|XL|XXL)(?:\s|$)/;
  const match = name.match(sizePattern);
  return match ? match[1] : null;
}

function cleanProductName(name) {
  const patterns = [
    /\d+\s*(мл|г|гр|кг|шт|ml|g|kg|pcs|шт|см|см\.)/,
    /\b(С собой|На вынос|на вынос|в зале|В зале)\b/i,
  ];

  patterns.forEach((pattern) => {
    name = name.replace(pattern, '').trim();
  });

  return name;
}

function convertNumberToSize(number) {
  const sizeMap = {
    250: 'M',
    350: 'L',
    450: 'XL',
    600: 'XXL',
  };

  return sizeMap[number] || null;
}

// Функция для группировки товаров
function groupProducts(products) {
  const groupedProducts = products.reduce((acc, product) => {
    const baseName = product.name.split(' ')[0];
    const size =
      extractSizeFromName(product.name) || convertNumberToSize(product.price);
    const place = product.place || 'default';

    const groupKey = `${baseName}-${place}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        name: baseName,
        articul: product.articul,
        price: product.price,
        place: product.place,
        category: getCategory(product.place),
        description: product.description,
        sizes: [],
        image: product.image,
      };
    }

    if (!size) {
      return acc;
    }

    const existingSize = acc[groupKey].sizes.find(
      (item) => item.size === size && item.price === product.price,
    );

    if (!existingSize) {
      acc[groupKey].sizes.push({
        size,
        price: product.price,
      });
    }

    return acc;
  }, {});

  return Object.values(groupedProducts);
}

function parseXlsxFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Файл ${filePath} не найден.`);
  }

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (jsonData.length === 0 || !Array.isArray(jsonData[0])) {
      throw new Error('Файл не содержит данных или заголовков.');
    }

    const headers = jsonData[0];
    const result = [];

    jsonData.slice(1).forEach((row) => {
      while (row.length < headers.length) {
        row.push('');
      }
      if (row.length !== headers.length) {
        console.warn(
          ` Строка с количеством столбцов ${row.length} не соответствует заголовкам.`,
        );
        return;
      }

      const rowObject = {};
      row.forEach((cell, index) => {
        rowObject[headers[index]] = cell;
      });

      if (!rowObject['price'] || rowObject['price'] <= 0) {
        return;
      }

      rowObject['category'] = getCategory(rowObject['place'] || '');
      rowObject['description'] = generateDescription(
        rowObject['name'],
        rowObject['category'] ? rowObject['category'].name : 'other',
      );

      const cleanName = cleanProductName(rowObject['name']);
      rowObject['name'] = cleanName;

      if (!rowObject.sizes) {
        rowObject.sizes = [];
      }

      const size =
        extractSizeFromName(rowObject['name']) ||
        convertNumberToSize(rowObject['price']);
      if (size) {
        rowObject.sizes.push({
          size,
          price: rowObject['price'],
        });
      }

      result.push(rowObject);
    });

    return result;
  } catch (error) {
    throw new Error(`Ошибка при чтении файла: ${error.message}`);
  }
}

function saveDataToDatabaseFile(data) {
  const dbPath = './database.js';

  console.log('Data passed to saveDataToDatabaseFile:', data); // Add this for debugging

  const exportData = `module.exports = [\n${data
    .map((item) => {
      if (!item.description) {
        item.description = 'Описание недоступно'; // Заглушка, если описание не сгенерировалось
      }

      return `  {
        name: '${item.name}',
        articul: '${item.articul}',
        price: ${item.price},
        place: '${item.place}',
        category: ${JSON.stringify(item.category)}, // Добавляем категорию
        description: '${item.description}',
        sizes: ${JSON.stringify(item.sizes)},
        image: '${item['image ']}' 
      }`;
    })
    .join(',\n')}\n];`;

  try {
    writeFileSync(dbPath, exportData, 'utf-8');
    console.log('Данные успешно записаны в файл database.js');
  } catch (error) {
    console.error(`Ошибка при записи в файл: ${error.message}`);
  }
}

const filePath = './food.xlsx';
try {
  const parsedData = parseXlsxFile(filePath);
  const groupedData = groupProducts(parsedData);
  saveDataToDatabaseFile(groupedData);
} catch (error) {
  console.error(error.message);
}
