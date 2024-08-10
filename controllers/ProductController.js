import ProductModel from '../models/Product.js';

export const getProducts = async (req, res) => {
    try {
        const { filterType } = req.params;
        const products =
            filterType === 'all'
                ? await ProductModel.find()
                : await ProductModel.find({
                      type: filterType,
                  });

        if (!products)
            return res.status(404).json({
                message: 'Products not found',
            });

        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get products',
        });
    }
};

// admin

export const addProduct = async (req, res) => {
    try {
        const { name, scoresCount, type } = req.body;
        const product = new ProductModel({
            name,
            scoresCount,
            type,
        });
        await product.save();
        res.json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to add product',
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(
            req.params.productId
        );
        if (!product)
            return res.status(404).json({
                message: 'Product not found',
            });
        res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to delete product',
        });
    }
};
