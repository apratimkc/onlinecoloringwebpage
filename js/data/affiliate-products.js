const AFFILIATE_PRODUCTS = [
  // Crayons
  { name: "Crayola Washable Crayons 64ct (2 Boxes)", asin: "B07KY2HBCM", type: "Crayons", categories: ["all"], price: "$10-20", description: "Washable crayons in a bulk twin-pack; ideal for coloring books and school use ages 3+" },
  { name: "Crayola Crayon Tub 240ct", asin: "B084ZQVW1W", type: "Crayons", categories: ["all"], price: "$20-40", description: "Large tub of 240 assorted-color crayons; great value bulk supply for kids ages 3+" },
  { name: "Crayola Large Crayons 8 Count", asin: "B001E63EJS", type: "Crayons", categories: ["all"], price: "$5-10", description: "Oversized easy-grip crayons for toddlers and young children ages 2+" },
  { name: "Crayola My First Jumbo Crayons 8ct", asin: "B00BUIE8OU", type: "Crayons", categories: ["all"], price: "$5-10", description: "Extra-thick toddler crayons with wide barrel for little hands ages 12+ months" },
  { name: "Crayola Special Effects Crayon Set 5 Pack", asin: "B0CBCR7C87", type: "Crayons", categories: ["all"], price: "$20-40", description: "Five specialty 24-count packs: glitter, pastel, bold, neon, and metallic crayons for kids" },
  { name: "Crayola Large Egg Crayons 12ct", asin: "B08JWCL49F", type: "Crayons", categories: ["all"], price: "$5-10", description: "Egg-shaped washable crayons sized perfectly for toddler hands ages 1+" },
  { name: "Crayola Crayons Bulk 24 Packs", asin: "B00Y4QBJAQ", type: "Crayons", categories: ["all"], price: "$20-40", description: "Classpack of 24 boxes of crayons for school and party supply needs ages 3+" },
  { name: "RoseArt Crayons 24 Count", asin: "B008M47GJE", type: "Crayons", categories: ["all"], price: "$5-10", description: "Affordable 24-count crayon pack; non-toxic and great for everyday coloring" },
  { name: "RoseArt 64-Count Crayons", asin: "B003O85ID4", type: "Crayons", categories: ["all"], price: "$5-10", description: "Budget-friendly 64-color crayon set for kids; packaging may vary" },
  { name: "RoseArt 24 Count Non-Toxic Crayons", asin: "B000V19LSK", type: "Crayons", categories: ["all"], price: "$5-10", description: "Classic non-toxic 24-count crayons for children at home or school" },

  // Colored Pencils
  { name: "Crayola Twistables Colored Pencils 50ct", asin: "B07D4RN9NH", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "No-sharpen twist-up colored pencils for kids 4+; 50 colors including 20 exclusive shades" },
  { name: "Crayola Twistables Colored Pencils 65ct with Art Case", asin: "B00AHAJEF0", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "65-piece set with 25 twist-up pencils and 40 drawing sheets in a portable plastic case" },
  { name: "Crayola Twistables Art Bundle 50ct Pencils + 50ct Mini Crayons", asin: "B09XMDS8TV", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "No-sharpen bundle combining 50 colored pencils and 50 mini crayons for school supplies" },
  { name: "Crayola Twistable Colored Pencils 18ct", asin: "B000GYZ2CG", type: "Colored Pencils", categories: ["all"], price: "$5-10", description: "Compact 18-count twist-up colored pencils for ages 3+; no sharpener needed" },
  { name: "ARTEZA 100 Colored Pencils Double-Sided 50ct", asin: "B099GBKV37", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "50 double-sided pre-sharpened pencils giving 100 colors in one pack for kids" },
  { name: "ARTEZA Scented Colored Pencils 24 Triangular", asin: "B099GK7KRY", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "24 fun-scented triangular pencils in aromas like mango, strawberry, and chocolate" },
  { name: "ARTEZA 48 Colored Pencils Vibrant Triangular", asin: "B099GC6ZT9", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "48 highly pigmented pre-sharpened triangular pencils designed for layering and blending" },
  { name: "ARTEZA Kids Colored Pencils 48ct Metallic and Neon", asin: "B099GS3MNG", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "48 metallic and neon triangular pre-sharpened colored pencils for drawing and doodling" },
  { name: "Arteza Kids Erasable Colored Pencils 48ct", asin: "B099GHQQHV", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "48 erasable vibrant triangular colored pencils; smooth colors perfect for coloring and school" },
  { name: "Faber-Castell Classic Colored Pencils Tin 48 Colors", asin: "B01MCTOLRY", type: "Colored Pencils", categories: ["all"], price: "$20-40", description: "48-color tin set with eraser, sharpener, and sketch pencils; premium kids art product" },
  { name: "Faber-Castell Classic Colored Pencils Tin 36 Colors", asin: "B01LWVTMY9", type: "Colored Pencils", categories: ["all"], price: "$20-40", description: "36 vibrant colors in a sturdy metal tin case; premium quality for kids" },
  { name: "Faber-Castell Jumbo Grip Colouring Pencils 12ct", asin: "B0007OECLC", type: "Colored Pencils", categories: ["all"], price: "$10-20", description: "Triangular jumbo-grip shatterproof 12-color pencils designed for children and adults" },
  { name: "Faber-Castell Grip Colored EcoPencils 12ct", asin: "B000TRC1MO", type: "Colored Pencils", categories: ["all"], price: "$5-10", description: "Eco-friendly 12-count grip colored pencils made from FSC-certified wood for kids" },

  // Washable Markers
  { name: "Crayola Ultra Clean Washable Markers 40ct Broad Line", asin: "B013RQPB5C", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "40 broad-line ultra-clean washable markers in assorted colors for kids ages 3+" },
  { name: "Crayola Washable Broad Line Marker Variety Set 64ct", asin: "B00J8PKQGQ", type: "Washable Markers", categories: ["all"], price: "$20-40", description: "64-piece variety set including ultra-clean, window, and gel FX markers for kids 3+" },
  { name: "Crayola Ultra Clean Fine Line Washable Markers 40ct", asin: "B019592A6I", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "40 fine-tip ultra-clean washable markers with 40 different colors for kids ages 3+" },
  { name: "Crayola Super Tips Marker Set 100ct", asin: "B071CP6X88", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "100 washable super-tip markers for kids and adults; makes thick and thin lines" },
  { name: "Crayola Super Tips Washable Markers 50ct", asin: "B00004UFOO", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "50-count washable super-tip markers for coloring books and art projects ages 3+" },
  { name: "Crayola Super Tips Washable Marker Set 65ct", asin: "B00AHAJEGE", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "65-piece washable super-tip marker gift set for kids; convenient storage included" },
  { name: "Crayola Supertips Washable Markers 80ct", asin: "B07MSBF4HS", type: "Washable Markers", categories: ["all"], price: "$10-20", description: "80-count bulk classroom supply of washable supertip markers with 12 scented shades" },
  { name: "Crayola My First Ultra-Clean Washable Markers 8ct", asin: "B006UBM1M8", type: "Washable Markers", categories: ["all"], price: "$5-10", description: "8 classic-color toddler markers with crush-proof tips designed for little hands ages 2+" },

  // Watercolor Paint
  { name: "Crayola Watercolor Paint Set 16ct", asin: "B000CD0Q1I", type: "Watercolor Paint", categories: ["all"], price: "$5-10", description: "16-color washable watercolor paint set with one paint brush for kids ages 4+" },
  { name: "Crayola Washable Watercolors 24ct", asin: "B01KQDP3XE", type: "Watercolor Paint", categories: ["all"], price: "$5-10", description: "24-color washable watercolor paint set; safe, non-toxic, and easy to clean up for kids" },
  { name: "Neliblu Watercolor Paint Set Pack of 24", asin: "B07KSMVXRC", type: "Watercolor Paint", categories: ["all"], price: "$10-20", description: "Bulk 24-pack of 8-color washable watercolor sets with brush; great for parties and classrooms" },
  { name: "Watercolor Paint Set 48 Colors with Refillable Water Brush", asin: "B092QTCLTM", type: "Watercolor Paint", categories: ["all"], price: "$10-20", description: "48-color non-toxic washable watercolor set with refillable water brush pen and palette" },
  { name: "Bedwina Watercolor Paint Sets Bulk Pack of 12", asin: "B088HHRNLP", type: "Watercolor Paint", categories: ["all"], price: "$10-20", description: "Bulk 12-pack of 8-color washable watercolor sets with palette tray and brush" },
  { name: "Ezzgol Watercolor Paint Sets Bulk Pack of 24", asin: "B08X27QJTC", type: "Watercolor Paint", categories: ["all"], price: "$20-40", description: "24 individual 8-color watercolor sets with wooden brush; bulk classroom art supply" },

  // Art Activity Kits
  { name: "ARTEZA Kids Painting and Drawing Kit 75-Piece Bundle", asin: "B09GVJ47MX", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "75-piece all-in-one kit with mini colored pencils, watercolors, oil pastels, and crayons" },
  { name: "VigorFun Art Supplies 240-Piece Drawing Art Kit Pink", asin: "B09BCJNNXD", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "240-piece art set with trifold easel, sketch pads, crayons, colored pencils, and watercolors" },
  { name: "VigorFun Art Supplies 240-Piece Drawing Art Kit Black", asin: "B09BCK2BJT", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "240-piece comprehensive art kit with double-sided easel for kids ages 4-12" },
  { name: "Crayola Silly Scents Inspiration Art Case 80 Pieces", asin: "B08V1M9R6K", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "80-piece art case with scented markers, twistable crayons, and colored pencils; holiday gift set" },
  { name: "Melissa and Doug Created by Me Stencil Art Kit", asin: "B07D2MPQRN", type: "Art Activity Kits", categories: ["all"], price: "$10-20", description: "170+ stencil designs with 6 markers, 2 crayons, and paper for kids creative coloring activities" },
  { name: "Melissa and Doug Jumbo 50-Page Kids Coloring Pads 3-Pack", asin: "B01DU1CC24", type: "Art Activity Kits", categories: ["animals", "vehicles"], price: "$10-20", description: "Three 50-page coloring pads featuring animals, vehicles, and mixed themes on premium paper" },
  { name: "Melissa and Doug Paint with Water Books Farm Ocean Safari", asin: "B00FS5LQK0", type: "Art Activity Kits", categories: ["animals", "ocean"], price: "$10-20", description: "Three paint-with-water activity books (Farm, Ocean, and Safari); 20 pictures per book" },
  { name: "Zefy 3800 Plus Pcs Arts and Crafts Kit for Kids", asin: "B0G2RXVX71", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "3800+ piece all-in-one craft kit with 20 project designs; ideal gift for girls and boys ages 4-12" },
  { name: "SMILESSKIDDO Arts and Craft Supplies for Kids 1000+ PCS", asin: "B0FFGSR37B", type: "Art Activity Kits", categories: ["all"], price: "$20-40", description: "1000+ piece toddler DIY art supply kit in portable 3-layer storage box; gift for girls ages 4-12" },

  // Animal Coloring Books
  { name: "Animals of the World Kids Coloring Book Jungle Edition", asin: "B0GCVN3H1X", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "30 amazing jungle animal illustrations for children ages 6-12 to discover and color" },
  { name: "Animals Coloring Book with Fun Facts", asin: "B0D8MV4BP9", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "Educational animal coloring book for kids 4-8 with amazing facts and 5 bonus maze puzzles" },
  { name: "Animals Color and Learn Coloring Book", asin: "B0FVF1QQYN", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "83-page animal coloring book with cute illustrations and fascinating facts for kids 4-8" },
  { name: "Animal Kingdom Wild Wonders Coloring Book", asin: "B0DW97JJ2X", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "Adventurous animal coloring book for kids ages 4+ with a wide variety of wild animal scenes" },
  { name: "ABC Animal Coloring Book Learn A-Z with Animals", asin: "B0GKTVWW23", type: "Coloring Book", categories: ["animals", "alphabets"], price: "$5-10", description: "Educational A-Z animal coloring book helping children learn the alphabet with bold outlines" },
  { name: "Animal Coloring Book for Kids by Little Rose", asin: "B0GS6K9V29", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "Animal coloring book featuring jungle, farmyard, and ocean creatures for kids and adults" },
  { name: "Dinosaur Coloring Book for Kids Age 5-7", asin: "B0C91GWG6F", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "Dinosaur coloring book for children 5-7 with over 25 dynamic illustrations and 50+ pages" },
  { name: "Cute Dinosaur Coloring Book 48 Baby Dino Pages", asin: "B0D7MXZTT5", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "48 adorable baby dinosaur pages for kids, teens, and adults; cute and creative dino designs" },
  { name: "Melissa and Doug Jumbo Coloring Pad 50 Pages Animals", asin: "B006691LZW", type: "Coloring Book", categories: ["animals"], price: "$5-10", description: "50-page 11x14 inch animal coloring pad with large bold animal outlines for kids" },

  // Princess / Unicorn Coloring Books
  { name: "Unicorn and Princess Coloring Book for Kids Ages 4-8 by Tillman", asin: "B08QRVHXL2", type: "Coloring Book", categories: ["princess", "unicorns"], price: "$5-10", description: "Coloring activity book with unicorn and princess drawings, mazes, and dice games for ages 4-8" },
  { name: "Unicorn and Princess Coloring Book Ages 4-8 by Mira Bloom", asin: "B0GHFZKT94", type: "Coloring Book", categories: ["princess", "unicorns"], price: "$5-10", description: "60 magical coloring pages with unicorns, princesses, fairies, and mermaids for ages 4-8" },
  { name: "Unicorn Coloring Book for Kids Ages 4-8 Vol 1", asin: "B09LGNC1DS", type: "Coloring Book", categories: ["unicorns"], price: "$5-10", description: "Unicorn, rainbow, and princess coloring fun in US Edition Volume 1 for ages 4-8" },
  { name: "Unicorn Mermaid and Princess Coloring Book", asin: "B08KX46ZSS", type: "Coloring Book", categories: ["princess", "unicorns"], price: "$5-10", description: "10,000+ five-star-rated coloring book with magical unicorns, beautiful princesses, and mermaids" },
  { name: "Princess Unicorn Coloring Pages for Kids", asin: "B0CKZGPS5F", type: "Coloring Book", categories: ["princess", "unicorns"], price: "$5-10", description: "Dedicated princess and unicorn coloring pages for young children; single-sided printing" },

  // Vehicle Coloring Books
  { name: "Construction and Transportation Vehicles Coloring Book", asin: "B09244CLCQ", type: "Coloring Book", categories: ["vehicles"], price: "$5-10", description: "Coloring book featuring trains, cars, boats, dump trucks, and planes for toddlers and kids" },
  { name: "Transportation Coloring Book Cool Cars Planes Trains Bikes", asin: "B08W7DK719", type: "Coloring Book", categories: ["vehicles"], price: "$5-10", description: "Amazing collection of vehicle coloring pages including cars, planes, trains, bikes, and boats" },
  { name: "Vehicles Coloring Book For Toddlers Ages 2-5 A-Z", asin: "B08JF5M4H6", type: "Coloring Book", categories: ["vehicles"], price: "$5-10", description: "A-Z vehicles coloring book for toddlers featuring helicopters, trains, trucks, diggers, and ships" },
  { name: "Vehicles Coloring Book Trucks Ships Planes and Cars", asin: "B09Z6X5STD", type: "Coloring Book", categories: ["vehicles"], price: "$5-10", description: "Fun activity vehicle coloring book for boys and girls ages 3-8 covering trucks, ships, planes, and cars" },

  // Ocean / Nature Coloring Books
  { name: "Sea Life Coloring Book for Kids Ages 4-8", asin: "B087LP257W", type: "Coloring Book", categories: ["ocean"], price: "$5-10", description: "32-page ocean animal coloring book for kids 4-8 with one-sided pages to prevent color bleed" },
  { name: "Ocean Animals Coloring Book with Fun Facts", asin: "B0DBLV13TR", type: "Coloring Book", categories: ["ocean"], price: "$5-10", description: "Underwater adventure coloring book with 50+ fun facts about marine life for ages 4-8" },
  { name: "Ocean Coloring Book for Kids Toddlers", asin: "1705619967", type: "Coloring Book", categories: ["ocean"], price: "$5-10", description: "Sea animal coloring book for boys and girls with easy-to-color designs building fine motor skills" },
  { name: "Sea Animals Coloring Book for Kids Ages 4-12", asin: "B0D84787CY", type: "Coloring Book", categories: ["ocean"], price: "$5-10", description: "39 cartoon sea animal coloring pages sized 8.5x11 for kids ages 4-12" },
  { name: "50 Butterfly and Flowers Coloring Book for Kids", asin: "B0DNTTMB7R", type: "Coloring Book", categories: ["nature", "flowers"], price: "$5-10", description: "Butterfly and flower coloring designs for boys and girls 4-8 with engaging nature illustrations" },
  { name: "Kids Nature Magic Coloring Book Flowers Birds and Butterflies", asin: "B0GH25HQZY", type: "Coloring Book", categories: ["nature", "flowers"], price: "$5-10", description: "Easy nature coloring pages featuring flowers, birds, and butterflies for children ages 3-9" },
  { name: "Flower Coloring Book for Kids and Adults 120 Designs", asin: "B0BQ9GFFDS", type: "Coloring Book", categories: ["flowers"], price: "$5-10", description: "120 relaxing nature and plant designs to color; suitable for kids and adults" },

  // Fantasy / Dragon Coloring Books
  { name: "Bold and Easy Mythical Dragons Coloring Book 50 Pages", asin: "B0DSTVDMD5", type: "Coloring Book", categories: ["fantasy"], price: "$5-10", description: "50 fantasy dragon coloring pages for kids and adults; bold easy designs for stress relief" },
  { name: "Fun Dragons Coloring Book 30 Designs", asin: "B0DL4DS55X", type: "Coloring Book", categories: ["fantasy"], price: "$5-10", description: "30 unique hand-drawn dragon designs perfect for stress relief and creativity in kids and adults" },
  { name: "Dragon Coloring Book For Kids Ages 2-8", asin: "B08SGWNJLL", type: "Coloring Book", categories: ["fantasy"], price: "$5-10", description: "Dragon coloring book with personality-filled dragon designs to feed kids imagination ages 2-8" },
  { name: "Cute Animal Fantasy Coloring Book Unicorns Dragons and More", asin: "B0CF4CW212", type: "Coloring Book", categories: ["fantasy", "unicorns"], price: "$5-10", description: "Enchanting adventure coloring book featuring unicorns, dragons, and fantasy animals for kids" },

  // Alphabet Coloring Books
  { name: "Alphabet Tracing and Coloring Book for Kids Ages 3-5", asin: "B0F66NJQQ3", type: "Coloring Book", categories: ["alphabets"], price: "$5-10", description: "Teaches letters and handwriting through fun coloring and tracing activities for preschool/kindergarten" },
  { name: "ABC Alphabet Coloring Book for Kids Ages 3-6", asin: "B0GW5V5FQD", type: "Coloring Book", categories: ["alphabets"], price: "$5-10", description: "Fun animal coloring pages teaching uppercase and lowercase A-Z letters for preschoolers" },
  { name: "Coloring Book For Kids Learn The Alphabet", asin: "B09QFG4ZFT", type: "Coloring Book", categories: ["alphabets"], price: "$5-10", description: "Worksheet-style coloring book for learning the alphabet with letter activities for ages 3+" },
  { name: "ABC and 123 Coloring Book Alphabet and Numbers", asin: "B0DR34YQBC", type: "Coloring Book", categories: ["alphabets"], price: "$5-10", description: "Alphabet and number coloring book helping preschool kids explore letters, numbers, and early writing" },
  { name: "ABC Coloring Book for Kids Ages 4-8 Learn Letters with Fun", asin: "B0GW879PT6", type: "Coloring Book", categories: ["alphabets"], price: "$5-10", description: "Big simple letter designs with fun coloring for preschool and kindergarten early learners" },

  // Sticker Books
  { name: "National Geographic Kids Dinos Sticker Activity Book 1000 Stickers", asin: "1426317735", type: "Sticker Book", categories: ["animals"], price: "$5-10", description: "1000+ dinosaur stickers with fun activities, mazes, and games; ages 4-8" },
  { name: "National Geographic Kids Ocean Animals Sticker Book 1000 Stickers", asin: "1426324243", type: "Sticker Book", categories: ["ocean"], price: "$5-10", description: "1000+ ocean animal stickers featuring dolphins, fish, sea turtles, and seals" },
  { name: "National Geographic Kids Cool Animals Sticker Book 1000 Stickers", asin: "1426311133", type: "Sticker Book", categories: ["animals"], price: "$5-10", description: "1000+ cool animal stickers with fun games and activities for kids; educational and entertaining" },
  { name: "National Geographic Kids Amazing Animals Super Sticker Book 2000 Stickers", asin: "1426321074", type: "Sticker Book", categories: ["animals"], price: "$10-20", description: "Two-books-in-one with 2000+ amazing animal stickers; colorful scenes and educational content" },
  { name: "Big Stickers for Little Hands My Unicorns and Mermaids", asin: "1788433602", type: "Sticker Book", categories: ["unicorns"], price: "$5-10", description: "Large-format unicorn and mermaid sticker book for toddlers with simple activities and big stickers" },
  { name: "Unicorns Sticker Book by Fiona Watt Usborne", asin: "1805071564", type: "Sticker Book", categories: ["unicorns"], price: "$5-10", description: "Whimsical unicorn sticker book with 250+ stickers including 80 sparkly stickers for kids" },
  { name: "Melissa and Doug Colors and Shapes Coloring and Sticker Activity Pad", asin: "B0785VKSCK", type: "Sticker Book", categories: ["shapes"], price: "$5-10", description: "Colors and shapes coloring and sticker activity pad using FSC-certified materials for young kids" },
  { name: "Melissa and Doug ColorBlast Activity Book Sea Life", asin: "B009B7M4HU", type: "Sticker Book", categories: ["ocean"], price: "$5-10", description: "24-picture no-mess color-reveal activity book on ocean sea-life theme for on-the-go coloring" },
];
