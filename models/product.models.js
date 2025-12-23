import mongoose from "mongoose";

const Product = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "beer",
        "rum",
        "vodka",
        "whiskey",
        "wine",
        "gin",
        "brandy",
        "tequila",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", Product);
