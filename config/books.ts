export interface Book {
  id:          string;
  title:       string;
  cover:       any;          // require() asset for cover image
  pages:       any[];        // require() assets for each page
  status:      "free" | "locked";
}

export const BOOKS: Book[] = [
  {
    id:     "book-1",
    title:  "Scribble Stories",
    cover:  require("../assets/CoverPage.png"),
    status: "free",
    pages: [
      require("../assets/CoverPage.png"),
      require("../assets/Scribble_Stories_Intro_Page_1.png"),
      require("../assets/Scribble_Stories_Circle_Page_2.png"),
      require("../assets/Scribble_Stories_Circle_Practice_Page_3.png"),
      require("../assets/Scribble_Stories_Square_Page_4.png"),
      require("../assets/Scribble_Stories_Square_Practice_Page_5.png"),
      require("../assets/Scribble_Stories_Triangle_Page_6.png"),
      require("../assets/Scribble_Stories_Triangle_Practice_Page_7.png"),
      require("../assets/Scribble_Stories_Rectangle_Page_8.png"),
      require("../assets/Scribble_Stories_Rectangle_Practice_Page_9.png"),
      require("../assets/Scribble_Stories_Shapes_Together_Page_10.png"),
      require("../assets/Scribble_Stories_Shapes_Together_Practice_Page_11.png"),
      require("../assets/page1.png"),
      require("../assets/train_boat_page2_centered.png"),
      require("../assets/page2_centered.png"),
      require("../assets/Star_page.png"),
      require("../assets/rocket_page2_final.png"),
      require("../assets/house_page1_final.png"),
      require("../assets/heart_page.png"),
      require("../assets/car_page.png"),
      require("../assets/cloud_page.png"),
      require("../assets/flower_page.png"),
      require("../assets/train_boat_page1_refined.png"),
      require("../assets/robot_page.png"),
      require("../assets/Back_Cover.png"),
    ],
  },
  {
    id:     "book-2",
    title:  "Coming Soon",
    cover:  null,
    status: "locked",
    pages:  [],
  },
  {
    id:     "book-3",
    title:  "Coming Soon",
    cover:  null,
    status: "locked",
    pages:  [],
  },
];
