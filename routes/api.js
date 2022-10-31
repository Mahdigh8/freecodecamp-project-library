/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const Book = require("../models/book");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const allBooks = await Book.find({})
        .select("_id title commentcount")
        .exec();
      res.json(allBooks);
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title == "" || title == undefined)
        return res.status(400).send("missing required field title");
      const newBook = await Book.create({ title });
      const bookObj = newBook.toObject();
      delete bookObj.__v;
      delete bookObj.comments;
      delete bookObj.commentcount;
      res.status(201).json(bookObj);
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        console.log(err);
        res.send("Something Is Wrong.");
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let book = await Book.findById({ _id: bookid });
      if (!book) return res.status(400).send("no book exists");
      book = book.toObject();
      delete book.__v;
      delete book.commentcount;
      res.json(book);
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (comment == "" || comment == undefined)
        return res.status(400).send("missing required field comment");
      try {
        let book = await Book.findById({ _id: bookid });
        if (!book) return res.status(400).send("no book exists");
        book.comments.push(comment);
        book.commentcount++;
        await book.save();
        book = book.toObject();
        delete book.__v;
        delete book.commentcount;
        res.status(201).json(book);
      } catch (err) {
        console.log(err);
        res.send("Error!");
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const book = await Book.findOne({ _id: bookid });
        if (!book) return res.status(400).send("no book exists");
        await Book.findByIdAndDelete(bookid);
        res.send("delete successful");
      } catch (err) {
        console.log(err);
        res.send("Error!");
      }
    });
};
