'use client';
import React from "react";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="bg-gray-100">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="text-center py-8">
        <img
          alt="Restaurant logo"
          className="mx-auto mb-4 w-14 h-14"
          src="https://s3-alpha-sig.figma.com/img/db24/0331/0f206ef4180701ec963aff336898c1b5?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=eHLNXFgOPNFoQzO9Jn7fiCz0Ta82AV1oiX24lYrV~Q4ImQ0xJ4ceK9I2MSrm4DX~xGQjTv9XCuApbIORdoW4U1DGyCWvXeoN8zkQFGG0HoJznobYJ~34T8QcnkTpdvBEVkJOeTyYSGwiNJ7cXkCLo1T6y19Xf3oHl7IiiK4cW1Vw-Jlh81f99nsWT12wyv9ssRCbjY0YudWTKr4QBT6Xe4FhJRrFZ2Re4opcrZfotpkqkAVmKO7qmitvVtXNiwkgjZx4QdA2kyv-fXDbkd5G-0q-F0wC~zVW0WzsFIwumGe4qTjV6mH5D3UV6ImKceaQ~czJ-4Pvfiv7yUyUe88V7A__"
          style={{ width: "180px", height: "180px" }}
        />
        <h1 className="text-gray-700" style={{ fontSize: "40px",fontFamily: "sans-serif" }}>
          Welcome To HexaGrub
        </h1>
        <p className="text-gray-700" style={{ fontSize: "30px" }}>
          Welcome To IRestaurant - Where Every Meal Is An Experience!
        </p>
        <button className="mt-4 px-6 py-2 bg-white text-black border border-black rounded">
          Order Now
        </button>
      </main>

      {/* Menu Section */}
      <section className="bg-white py-8">
        <p
          className="mt-4 px-6 py-2 bg-white text-black border border-black rounded transition-transform transform hover:scale-105 hover:shadow-lg"
          style={{
            fontStyle: "normal sans-serif",
            color: "rgb(14, 13, 13)",
            borderRadius: "15px",
          }}
        >
          View Our Menu
        </p>

        <div className="flex justify-center mb-4">
          <input
            className="border border-gray-300 rounded px-4 py-2"
            placeholder="Search..."
            type="text"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
          <div className="text-center">
            <img
              alt="Appetizers"
              className="mx-auto mb-2"
              src="https://s3-alpha-sig.figma.com/img/3c1d/e2bd/d0770b0102054979bba08ef947503c6d?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=QWq6KjomYbko8uJ5hlcUUJz8mpBtwBW20-qwfAx142UCAPfsZt-dADB9XYXDzUztemtxa7nKE7GG5GNhqr91~ZYRUry2uFIegPeMCpAZTggM5VYPzJK21mFuMngvqUJeVY3gyrBepN9gjRrUbZ3Mo8FHH2LAQW5QGux2GUBvGNvzFlHGJfGFl3kIotzHcl8U~eknhSE9dfcnKeD6vWvopFz52xJqnavbXzR-Gu2llJ6iWbv2pq20StwQlHZu-KJr-t46uOxD5uFgLZcT-mZAENfK~qCFRsqW6NuXFx-QvKbMK4sZMVbAd8QcUcmkOCov9O8~LXTqF6WuKZaA9iN2hA__"
              style={{ width: "200px", height: "200px" ,}}
            />
            <a
              href="/htmlFile/appertizer.html"
              className="font-bold transition-transform transform hover:scale-105 hover:text-blue-500"
              style={{ fontSize: "20px" }}
            >
              Appetizers
            </a>
          </div>
          <div className="text-center">
            <img
              alt="Main Course"
              className="mx-auto mb-2"
              src="https://s3-alpha-sig.figma.com/img/46a1/3461/2b44a397eeced75fe77ba9575b346e5d?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=lbtyZr33mDV0eHUB8V-k7xSayJSX1q6k6S5CK9ie8kbkCRdtPA8RqVV0~J7Vlil39y-IF55TQKEukM~XOsk4ZqEo8YU1BYnn83lIkiqihB5XYjbEi8mGy5zC27RfCxICcD5Huh5yRnCz8vR6X1MAdprGdZUOTTtKURpdR1iNX9~LdmM7~QghSgy7a~A0VFgJxkmC7S6UcE684bw~PYAfUWACoaioJexQH8iz8vFJ1ecW3Rhr-H-6U1Qs36CllEd8DeZB7idoon0BLB1Klp86YO1WqzZP3c5b~5ouBxoEnYYx56CRzS~d3RcVFRWsJjq5ip80MrvrykxSb6v-o5BAuA__"
              style={{ width: "200px", height: "200px" }}
            />
            <button
              onClick={() => (window.location.href = "/htmlFile/main.html")}
              className="font-bold transition-transform transform hover:scale-105 hover:text-blue-500"
              style={{ fontSize: "20px" }}
            >
              Main Course
            </button>
          </div>
          <div className="text-center">
            <img
              alt="Drinks"
              className="mx-auto mb-2"
              src="https://s3-alpha-sig.figma.com/img/da23/3289/90c0cbee16ea42fc48dbeb899c49c3f0?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=TEPJ3czc2T3Ko3~~wGg9kwdBa2dgh~obOVR8voj3qV8SYhMe-wJWbuvAp1AWUIlig6SfWMjd~apExi9TLIlzKm5xeqcmgq2jffJcLHFDb9r6datILgxEhTtbsHmqzH90t6DpTQa-n3ixsJwUjxUvmKwWf1MeLPcWJT0bNyZge2EVdSLki4nNzMJDPIo-mgppJvUbctqlSFrJgEijVW6zGiAe2SD9xNJAnLobSs8nCRI0-qsnwyqxBlVc1Kmq29ertQvKxPn~-53Al1X6dUXqQyx-KgPwu1BENoLb69dea67PPp0AqxW0rRss55nz57EDDCty5bHJTHMkKNK7zKdCIw__"
              style={{ width: "200px", height: "200px" }}
            />
            <button
              onClick={() => (window.location.href = "/htmlFile/drink.html")}
              className="font-bold transition-transform transform hover:scale-105 hover:text-blue-500"
              style={{ fontSize: "20px" }}
            >
              Drinks
            </button>
          </div>
          <div className="text-center">
            <img
              alt="Dessert"
              className="mx-auto mb-2"
              src="https://s3-alpha-sig.figma.com/img/1873/aa31/588c420da0b1e48bf1b00097b3f63f5d?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DxSLZexx3KpxRfY1ggAdgpeoos0aoRsMctqixepJSN2fSV~K9way3xgbwDKr4sLCarew5lqxuulk7ykceoOSy33q2QnqCDZ0FSTkAWAfk8SYDKN9zQYb~h~sgklSeM6AKB3A27v5DMLTL4mvnVgJL6QxykEnrRB-ByI3WxE77vN1zTe3gd1s-aH3ZbvGwAmLtdvema2SMXt5f3CqbRQD8OMaqEcwPck2XgCUoAZttkKn5eKs2xTqqCPAuze51Vl3MpAt1YN13PAlHoG-aQg6Ghat8pxPpRvamE~9KCDfH7lbITcAzTb5GafxH1t~FkbXEkbh02N5uDwjwGTDHFxeGA__"
              style={{ width: "200px", height: "200px" }}
            />
            <button
              onClick={() => (window.location.href = "/htmlFile/dessert.html")}
              className="font-bold transition-transform transform hover:scale-105 hover:text-blue-500"
              style={{ fontSize: "20px" }}
            >
              Dessert
            </button>
          </div>
        </div>
      </section>

      {/* Signature Dish Section */}
      <section className="bg-white py-8">
        <h2
          className="text-2xl font-bold text-center mb-4"
          style={{ fontSize: "45.01px" }}
        >
          Signature Of Us
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center px-4">
          <div className="md:w-1/2 text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-3xl font-bold" style={{ fontSize: "40px" }}>
              Steak
            </h3>
            <p className="text-gray-700" style={{ fontSize: "30px" }}>
              Grilled To Perfection, With Options For Ribeye, Sirloin, Or Filet.
            </p>
            <button
              className="mt-4 px-6 py-2 bg-white text-black border border-black rounded"
              style={{
                cursor: "pointer",
                textAlign: "center",
                borderRadius: "15px",
              }}
            >
              Order Now
            </button>
          </div>
          <div className="md:w-1/2">
            <img
              alt="Steak dish"
              className="mx-auto"
              src="https://s3-alpha-sig.figma.com/img/4669/5055/56d64db2d58f0adacc9b5664d4a14b5e?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=VPJT3~UukxcS9yFGlUHUnkZeECwos8uh2oYtrlq49hw5kXokMOv0ErL7X6lpZnJTFDk2VfwkhFPLy8pEI7Q~6G-qs7yHQIWGb8k5p4J~D~EG2FOhSRzai9m0OuozESaAfwnYDg3LgSizkY9Iz8cKbURPYak7ZqD1DEzys~PE55RedPXiMhfKhUEO1mJWQ6ezMJgB7gnSed5Yh9ev-fltqOaN8p0R49G3FTZ8Xhi6WBSJMpOV0JdXqFokbLGDw3Nr2g0sPHXWWLWUadUiTh2gt2s4Utma9V2KV9jyoWaeBOqDUSPg85moPSm6QqJiH5-6mHVqF4RELyDOlchAik6THA__"
              style={{ width: "400px", height: "300px" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
