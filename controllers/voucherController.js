const Voucher = require("../models/Voucher");

module.exports = {
    addVoucher: async (req, res) => {
        const { title, description, discount, addVoucherSwitch, restaurant } = req.body;
     
        // Simple validation
        if (!title || !description || !discount || !restaurant) {
            return res.status(400).json({ status: false, message: 'Missing required fields' });
        }
        const newVoucher = new Voucher({
            title: req.body.title,
            description: req.body.description,
            discount: req.body.discount,
            addVoucherSwitch: req.body.addVoucherSwitch,
            restaurant: req.body.restaurant,
        });
    
        try {
            await newVoucher.save();
            res.status(201).json({ status: true, message: 'Voucher successfully created', data: newVoucher });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getAllVoucher: async (req, res) => {
        
        const restaurant = req.params.id;
      
        try {
          const vouchers = await Voucher.find({ restaurant: restaurant }).sort({ createdAt: -1 }); // Sort by date in descending order (newest first)
          console.log(vouchers);
          res.status(200).json(vouchers);
        } catch (error) {
          res.status(500).json({ status: false, message: error.message });
        }
    },
    updateVoucher: async (req, res) => {
        const voucherId = req.params.id;
        const { title, description, discount, addVoucherSwitch, restaurant } = req.body;
      
        
        if(!title || !description || !discount || !restaurant){
            return res.status(400).json({status: false, message: 'Missing required'});
        }

        try {
            const voucher = await Voucher.findByIdAndUpdate(
                voucherId,
                {
                    title, 
                    description, 
                    discount, 
                    addVoucherSwitch, 
                    restaurant
                },
                { new: true }
            );
            if(!voucher){
                return res.status(404).json({status: false, message: 'Voucher not found'});
            }
           
          
            res.status(200).json({ status: true, message: 'Voucher updated successfully', data: voucher });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    deleteVoucher: async (req, res) => {
        try {
          
            const deleteVoucher= await Voucher.findByIdAndDelete(
                req.params.id,  
            );
    
            if (!deleteVoucher) {
                return res.status(404).json({ status: false, message: 'Voucher item not found' });
            }
    
            res.status(200).json({ status: true, message: 'Voucher item successfully deleted', data: deleteVoucher });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}