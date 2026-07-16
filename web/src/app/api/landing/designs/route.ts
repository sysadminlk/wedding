import { NextResponse } from "next/server";

const designs = [
  {
    id: "atelier",
    name: "Atelier",
    description: "Dark espresso with gold accents and Playfair Display",
    thumbnailColor: "#2C1810",
    accentColor: "#C9A96E",
  },
  {
    id: "ivory",
    name: "Ivory",
    description: "Soft ivory with rose gold and Lora serif",
    thumbnailColor: "#FFFFF0",
    accentColor: "#B76E79",
  },
  {
    id: "cinema",
    name: "Cinema",
    description: "Dark dramatic with large hero and Oswald heading",
    thumbnailColor: "#0A0A0A",
    accentColor: "#D4AF37",
  },
  {
    id: "split",
    name: "Split",
    description: "Left-right split layout with two-tone design",
    thumbnailColor: "#1A1A2E",
    accentColor: "#E8D5B7",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-style with bold DM Serif Display typography",
    thumbnailColor: "#FAF9F6",
    accentColor: "#8B0000",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white minimal design with Inter font",
    thumbnailColor: "#FFFFFF",
    accentColor: "#333333",
  },
  {
    id: "gilded",
    name: "Gilded",
    description: "Luxe gold with ornate borders and Playfair Display",
    thumbnailColor: "#1C1C1C",
    accentColor: "#D4AF37",
  },
  {
    id: "folio",
    name: "Folio",
    description: "Photo-forward grid layout with Source Sans",
    thumbnailColor: "#2D2D2D",
    accentColor: "#E6C9A8",
  },
  {
    id: "portrait",
    name: "Portrait",
    description: "Centered single-column elegant design with Cormorant Garamond",
    thumbnailColor: "#F8F4F0",
    accentColor: "#7B6B5D",
  },
  {
    id: "deco",
    name: "Deco",
    description: "Art deco geometric with gold and black, Poiret One",
    thumbnailColor: "#0D0D0D",
    accentColor: "#FFD700",
  },
];

export async function GET() {
  return NextResponse.json({ designs });
}
