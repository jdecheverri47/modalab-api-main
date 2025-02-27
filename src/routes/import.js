import express from "express";
import xlsx from "xlsx";
import fs from "fs";
import multer from "multer";
import {
  Collections,
  Designer,
  Verticals,
  Categories,
  Subcategories,
  ProductSubcategories,
  Variant,
  Color,
  Product,
  DesignerInfo,
  Style,
} from "../models/index.js";
import chalk from "chalk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

function isDataComplete(item) {
  // Verifica que todos los campos requeridos no sean null o undefined
  return (
    item.name != null &&
    item.description != null &&
    item.slug != null &&
    item.coverImage != null &&
    item.profile_image != null &&
    item.about != null &&
    item.country != null &&
    item.physical_store != null &&
    item.current_stockists != null &&
    item.categories != null &&
    item.wholesale_markup != null &&
    item.wholesale_price_start != null &&
    item.wholesale_price_end != null &&
    item.retail_price_start != null &&
    item.retail_price_end != null &&
    item.brand_values != null &&
    item.website != null &&
    item.social_media != null &&
    (item.minimum_order_quantity != null || item.minimum_value != null)
  );
}

function isCollectionComplete(item) {
  // Asegúrate de que todos los campos requeridos tengan valores
  return (
    item.name &&
    item.cover_image &&
    item.designer_slug &&
    item.season &&
    item.order_type
  );
}

function getMonthNumber(monthName) {
  const monthNames = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  if (monthName) {
    return monthNames[monthName.toLowerCase()];
  }
  return null;
}

function getDateFromMonthAndYear(monthName, year) {
  const monthNumber = getMonthNumber(monthName);
  const currentDate = new Date();

  // Si `monthNumber` o `year` son null, usa la fecha actual
  let finalYear = year || currentDate.getFullYear();
  finalYear = parseInt(finalYear, 10);

  // Ajusta el año si es un valor de dos dígitos
  if (finalYear >= 0 && finalYear <= 99) {
    finalYear += 2000; // Asumiendo que quieres años entre 2000 y 2099
  }

  const finalMonth = monthNumber != null ? monthNumber : currentDate.getMonth();
  const finalDay = 1; // Puedes cambiarlo al día deseado o usar el primer día del mes

  const date = new Date(finalYear, finalMonth, finalDay);
  return date.toISOString().split("T")[0]; // Retorna solo `YYYY-MM-DD`
}

async function assignProductToSubcategories(product, subcategories) {
  for (const subcategory of subcategories) {
    await ProductSubcategories.findOrCreate({
      where: {
        product_id: product.id,
        subcategory_id: subcategory,
      },
    });

    console.log(
      chalk.green(`Producto asignado a subcategoría: ${subcategory}`)
    );
  }
}

async function findOrCreateSubcategories({ category_id, subcategories }) {
  const result = [];
  for (const subcategoryName of subcategories) {
    // Busca o crea cada subcategoría por separado
    const [subcategory, created] = await Subcategories.findOrCreate({
      where: {
        name: subcategoryName,
        category_id,
      },
    });

    // Agrega la subcategoría al resultado
    result.push(subcategory.id);
  }

  return result;
}

function isProductComplete(item) {
  return (
    item.name &&
    item.description &&
    item.composition &&
    item.product_care &&
    item.main_image &&
    item.other_images &&
    item.slug &&
    item.wholesale_price &&
    item.retail_price &&
    item.designer_slug &&
    item.collection &&
    item.vertical &&
    item.categories &&
    item.subcategories &&
    item.variants &&
    item.style
  );
}

router.post("/import-designers", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path; // Temporary uploaded file path

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Insert data into the database only if it's complete
    for (const item of data) {
      try {
        if (isDataComplete(item)) {
          const existingDesigner = await Designer.findOne({
            where: { slug: item.slug },
          });

          if (!existingDesigner) {
            // Create the designer if it doesn't exist
            const designer = await Designer.create({
              name: item.name,
              description: item.description,
              slug: item.slug,
              coverImage: item.coverImage,
              profile_image: item.profile_image,
              about: item.about,
              country: item.country,
            });

            // Parse arrays
            let parsedCategories,
              parsedCurrentStockists,
              parsedSocialMedia,
              parsedBrandValues,
              parsedStyles;

            try {
              parsedCategories = Array.isArray(item.categories)
                ? item.categories
                : JSON.parse(item.categories);
              parsedCurrentStockists = Array.isArray(item.current_stockists)
                ? item.current_stockists
                : JSON.parse(item.current_stockists);
              parsedSocialMedia = Array.isArray(item.social_media)
                ? item.social_media
                : JSON.parse(item.social_media);
              parsedBrandValues = Array.isArray(item.brand_values)
                ? item.brand_values
                : JSON.parse(item.brand_values);
              parsedStyles = Array.isArray(item.styles)
                ? item.styles
                : JSON.parse(item.styles);

              // Validate arrays
              if (
                !Array.isArray(parsedCategories) ||
                !Array.isArray(parsedCurrentStockists) ||
                !Array.isArray(parsedSocialMedia) ||
                !Array.isArray(parsedBrandValues) ||
                !Array.isArray(parsedStyles)
              ) {
                throw new Error(
                  "One of the values is not an array after parsing."
                );
              }
            } catch (error) {
              console.error(
                chalk.red(`Error parsing values for ${item.name}:`),
                error
              );
              continue; // Skip this item if there's a parsing error
            }

            try {
              await DesignerInfo.create({
                physical_store: item.physical_store,
                current_stockists: parsedCurrentStockists,
                categories: parsedCategories,
                wholesale_markup: item.wholesale_markup,
                wholesale_price_start: item.wholesale_price_start,
                wholesale_price_end: item.wholesale_price_end,
                retail_price_start: item.retail_price_start,
                retail_price_end: item.retail_price_end,
                brand_values: parsedBrandValues,
                website: item.website,
                social_media: parsedSocialMedia,
                designer_id: designer.id,
                minimum_order_quantity: item.minimum_order_quantity,
                minimum_value: item.minimum_value,
              });

              console.log(
                chalk.green(`DesignerInfo created for ${item.name}.`)
              );
            } catch (error) {
              console.error(
                chalk.red(`Error creating DesignerInfo for ${item.name}:`),
                error
              );
            }

            try {
              const foundStyles = await Style.findAll({
                where: {
                  name: parsedStyles,
                },
              });

              await designer.addStyles(foundStyles);
              console.log(chalk.green(`Styles associated to ${item.name}.`));
            } catch (error) {
              console.error(
                chalk.red(`Error associating styles for ${item.name}:`),
                error
              );
            }
          } else {
            console.log(
              chalk.yellow(`Designer already exists, skipped: ${item.name}.`)
            );
          }
        } else {
          console.log(
            chalk.yellow(`Row skipped due to incomplete data: ${item.name}.`)
          );
        }
      } catch (error) {
        console.error(
          chalk.red(`Error processing designer ${item.name}:`),
          error
        );
      }
    }

    // Delete the temporary file after processing
    fs.unlinkSync(filePath);

    res.status(200).send("Data imported successfully.");
  } catch (error) {
    res.status(500).send(`Error importing data: ${error.message}`);
  }
});

router.post("/import-collections", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path; // Ruta temporal del archivo subido

    // Leer archivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Insertar datos en la base de datos
    // Insertar datos en la base de datos solo si están completos
    for (const item of data) {
      if (isCollectionComplete(item)) {
        const existingDesigner = await Designer.findOne({
          where: { slug: item.designer_slug },
        });
        const existingCollection = await Collections.findOne({
          where: { name: item.name, designer_id: existingDesigner.id },
        });

        if (!existingCollection) {
          // Crear el designer si no existe
          await Collections.create({
            name: item.name,
            cover_image: item.cover_image,
            designer_id: existingDesigner.id,
            season: item.season,
            year: item.year,
            order_type: item.order_type,
            order_window_start: getDateFromMonthAndYear(
              item.order_window_start,
              item.year
            ),
            order_window_end: getDateFromMonthAndYear(
              item.order_window_end,
              item.year
            ),
          });
          console.log(chalk.green(`Collection created: ${item.name}`));
        } else {
          console.log(
            chalk.blue(`Collection already in db, skipped: ${item.name}`)
          );
        }
      } else {
        console.log(
          chalk.yellow("Row skipped for uncomplete data:", item.name)
        );
      }
    }

    // Eliminar archivo temporal después de procesarlo
    fs.unlinkSync(filePath);

    res.status(200).send(chalk.green("Datos importados exitosamente."));
  } catch (error) {
    res
      .status(500)
      .send(chalk.red(`Error al importar datos: ${error.message}`));
  }
});

router.post("/import-products", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Procesar cada elemento del archivo
    for (const item of data) {
      try {
        if (isProductComplete(item)) {
          // Manejo de errores al parsear JSON
          let subcategoriesArray, variantsArray;
          try {
            subcategoriesArray = JSON.parse(item.subcategories);
          } catch (error) {
            console.log(
              chalk.red(
                `Error al parsear subcategorías para el producto ${item.name}: ${error.message}`
              )
            );
            continue;
          }

          try {
            variantsArray = JSON.parse(item.variants);
          } catch (error) {
            console.log(
              chalk.red(
                `Error al parsear variantes para el producto ${item.name}: ${error.message}`
              )
            );
            continue;
          }

          // Buscar diseñador existente
          const existingDesigner = await Designer.findOne({
            where: { slug: item.designer_slug },
          });
          if (!existingDesigner) {
            console.log(
              chalk.red(`Diseñador no encontrado: ${item.designer_slug}`)
            );
            continue;
          }
          console.log(
            chalk.green(`Diseñador encontrado: ${existingDesigner.name}`)
          );

          // Buscar colección existente
          const existingCollection = await Collections.findOne({
            where: { name: item.collection, designer_id: existingDesigner.id },
          });
          if (!existingCollection) {
            console.log(
              chalk.red(`Colección no encontrada: ${item.collection}`)
            );
            continue;
          }
          console.log(
            chalk.green(`Colección encontrada: ${existingCollection.name}`)
          );

          // Verificar si el producto ya existe
          const existingProduct = await Product.findOne({
            where: {
              name: item.name,
              collection_id: existingCollection.id,
              designer_id: existingDesigner.id,
            },
          });
          if (existingProduct) {
            console.log(
              chalk.blue(
                `Producto ya existe en la base de datos, se omite: ${item.name}`
              )
            );
            continue;
          }

          // Crear o encontrar vertical y categoría
          const [vertical, createdVertical] = await Verticals.findOrCreate({
            where: { name: item.vertical },
          });
          console.log(
            chalk.green(
              `Vertical ${vertical.name} ${
                createdVertical ? "creado" : "ya existe"
              }`
            )
          );

          const [category, createdCategory] = await Categories.findOrCreate({
            where: { vertical_id: vertical.id, name: item.categories },
          });
          console.log(
            chalk.green(
              `Categoría ${category.name} ${
                createdCategory ? "creada" : "ya existe"
              }`
            )
          );

          // Crear subcategorías (asegurarse de que este método existe)

          const subcategories = await findOrCreateSubcategories({
            category_id: category.id,
            subcategories: subcategoriesArray,
          });
          console.log(
            chalk.green(`Subcategorías creadas: ${subcategories.join(", ")}`)
          );

          let otherImagesArray;

          try {
            otherImagesArray = JSON.parse(item.other_images);
            console.log(otherImagesArray);
          } catch (error) {
            console.log(
              chalk.red(
                `Error al parsear other_images para el producto ${item.name}: ${error.message}`
              )
            );
            continue;
          }

          // Crear el producto
          const product = await Product.create({
            name: item.name,
            description: item.description,
            composition: item.composition,
            product_care: item.product_care,
            main_image: item.main_image,
            other_images: otherImagesArray,
            slug: item.slug,
            tag: item.tag,
            detail_bullets: item.detail_bullets,
            wholesale_price: item.wholesale_price,
            retail_price: item.retail_price,
            weight: item.weight,
            collection_id: existingCollection.id,
            vertical_id: vertical.id,
            category_id: category.id,
            designer_id: existingDesigner.id,
            style: item.style,
            delivery_window_start: item.delivery_window_start,
            delivery_window_end: item.delivery_window_end,
            m_favorite: !!item.m_favorites,
          });
          console.log(chalk.green(`Producto creado: ${item.name}`));

          // Asignar subcategorías al producto (asegurarse de que esta función existe)

          await assignProductToSubcategories(product, subcategories);

          // Crear variantes del producto
          for (const variant of variantsArray.variants) {
            try {
              const [color, createdColor] = await Color.findOrCreate({
                where: {
                  name: variant.color.name,
                  hex: variant.color.hex_color,
                  brand_color: variant.color.brand_color,
                },
              });

              await Variant.create({
                color_id: color.id,
                product_id: product.id,
                stock: variant.stock,
                sizes: variant.sizes,
              });
              console.log(chalk.green(`Variante creada: ${variant.color_id}`));
            } catch (error) {
              console.log(
                chalk.red(
                  `Error al crear la variante para el producto ${item.name}: ${error.message}`
                )
              );
            }
          }
        } else {
          console.log(
            chalk.yellow(`Fila omitida por datos incompletos: ${item.name}`)
          );
        }
      } catch (error) {
        console.log(
          chalk.red(
            `Error al procesar el producto ${item.name || ""}: ${error.message}`
          )
        );
      }
    }

    // Eliminar el archivo después de procesarlo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(
          chalk.red(`Error al eliminar el archivo: ${err.message}`)
        );
      } else {
        console.log(chalk.green(`Archivo ${filePath} eliminado exitosamente.`));
      }
    });

    res.status(200).send("Datos importados exitosamente.");
  } catch (error) {
    console.error(
      chalk.red(`Error en la ruta /import-products: ${error.message}`)
    );
    res.status(500).send(`Error al importar datos: ${error.message}`);
  }
});

export default router;
