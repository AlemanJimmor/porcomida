// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
// define the schema for our user model
var busSchema = mongoose.Schema({
    _id             : ObjectId,
    loc             : { 
        lat         : Number,
        lng         : Number,
    },
    BUSSINESS       : {
        NAME        : String,
        INTRO       : String,
        DESCRIPTION : String,
        CATEGORY    : [ 
            String, 
            String, 
            String,
        ],
        BUDGET      : String,
        PAIDATHOME  : String,
        PICKUP      : String,
        DELIVERY    : String,
        CREDITCARD  : String,
        SCHEDULE    : {
            MONDAY  : {
                OPEN    : Number,
                BREAK   : Number,
                REOPEN  : Number,
                CLOSE   : Number,
            },
            TUESDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            },
            WEDNESDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            },
            THURSDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            },
            FRIDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            },
            SATURDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            },
            SUNDAY : {
                OPEN    : Number,
                CLOSE   : Number,
            }
        },
        PROMO       : String,
        RANK        : String,
        COMMENTS    : String,
        MINORDER    : Number,
        DELIVERYPRICE : String,
        LOGOTIPO : String,
    },
    ADDRESS : [ 
        {
            STREET : String,
            LOCALITY : String,
            NUMBER : String,
            STATE : String,
            CITY : String,
            ZIP : String,
            PHONE : String,
        },
    ],
    INFO : {
        USER : String,
        PASS : String,
        PROTADA : String,
        SALUDO : String,
        EMAIL : String,
        WEBSITE : String,
        idORDERS : [ 
            Number, 
            Number,
        ]
    },
    COMMENTS : [ 
        {
            idUSER : [ 
                Number,
            ],
            OPINION : String,
        }, 
    ],
    MENU : [ 
        {
            idPRODUCTO : [ 
                Number,
            ],
            NAME : String,
            DESCRIPTION : String,
            CATEGORY : String,
            LABEL : String,
            PRECI0 : Number,
            IMAGEN : String,
            EXTRAS : [ 
                Number, 
                Number, 
                Number,
            ],
            AVALIBLE : [
                Number,
            ],
        },
    ],
    EXTRAS : [ 
        {
            idEXTRAS : [ 
                Number,
            ],
            NAME : String,
            OPTIONS : [ 
                String, 
                String, 
                String,
            ],
        }, 
    ],
    PACKAGE : [ 
        {
            idPAC : [ 
                Number,
            ],
            NAME : String,
            DESCRIPTION : String,
            CONTIENE : [ 
                Number, 
                Number,
            ],
            PRECIO : Number,
        },
    ],
    AVALIBLE : [ 
        {
            idAVALIBLE : [ 
                Number,
            ],
            NAME : String,
            OPTIONS : {
                START : Number,
                END : Number,
            }
        },
    ]
});

// generating a hash
busSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
busSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('users', busSchema);
