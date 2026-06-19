import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const luckyRollTools: Tool[] = [
  {
    name: "list_categories",
    description: "Haal alle categorieën op van de gebruiker",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "list_items",
    description: "Haal alle items op van een specifieke categorie",
    input_schema: {
      type: "object",
      properties: {
        category_id: {
          type: "string",
          description: "Het ID van de categorie",
        },
      },
      required: ["category_id"],
    },
  },
  {
    name: "add_category",
    description: "Voeg een nieuwe categorie toe",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "De naam van de categorie",
        },
        icon: {
          type: "string",
          description: "Emoji icoon voor de categorie",
        },
      },
      required: ["name", "icon"],
    },
  },
  {
    name: "rename_category",
    description: "Hernoem een bestaande categorie",
    input_schema: {
      type: "object",
      properties: {
        category_id: {
          type: "string",
          description: "Het ID van de categorie",
        },
        name: {
          type: "string",
          description: "De nieuwe naam",
        },
        icon: {
          type: "string",
          description: "Het nieuwe emoji icoon (optioneel)",
        },
      },
      required: ["category_id", "name"],
    },
  },
  {
    name: "delete_category",
    description: "Verwijder een categorie en alle bijbehorende items",
    input_schema: {
      type: "object",
      properties: {
        category_id: {
          type: "string",
          description: "Het ID van de categorie om te verwijderen",
        },
      },
      required: ["category_id"],
    },
  },
  {
    name: "add_item",
    description: "Voeg een item toe aan een categorie",
    input_schema: {
      type: "object",
      properties: {
        category_id: {
          type: "string",
          description: "Het ID van de categorie",
        },
        title: {
          type: "string",
          description: "De naam van het item",
        },
      },
      required: ["category_id", "title"],
    },
  },
  {
    name: "add_items_bulk",
    description: "Voeg meerdere items tegelijk toe aan een categorie",
    input_schema: {
      type: "object",
      properties: {
        category_id: {
          type: "string",
          description: "Het ID van de categorie",
        },
        titles: {
          type: "array",
          items: { type: "string" },
          description: "Lijst van item namen",
        },
      },
      required: ["category_id", "titles"],
    },
  },
  {
    name: "delete_item",
    description: "Verwijder een item",
    input_schema: {
      type: "object",
      properties: {
        item_id: {
          type: "string",
          description: "Het ID van het item",
        },
      },
      required: ["item_id"],
    },
  },
  {
    name: "update_item",
    description: "Wijzig de naam of favoriet-status van een item",
    input_schema: {
      type: "object",
      properties: {
        item_id: {
          type: "string",
          description: "Het ID van het item",
        },
        title: {
          type: "string",
          description: "De nieuwe naam (optioneel)",
        },
        favorite: {
          type: "boolean",
          description: "Of het item een favoriet is (optioneel)",
        },
      },
      required: ["item_id"],
    },
  },
];
