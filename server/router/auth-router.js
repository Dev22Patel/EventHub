const express = require("express")
const router = express.Router();
const {home} = require("../controllers/auth-controller");

router.route("/").get(home);

router.route("/register").get((req,res)=>{
    res
        .status(200)
        .send("Auth page dev");
});

module.exports=router;
