---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---
<link rel="stylesheet" href="main.css" type="text/css">
<!-- <!DOCTYPE html> -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    </style>
</head>
<body>
    <div class="wrapper">
       <div class="section">
            <div class="top_navbar">
                <div class="hamburger">
                    <a href="#">
                        <i class="fas fa-bars"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="sidebar">
           <!--profile image & text-->
            <ul>
                <li>
                    <a href="#" class="active">
                        <span class="icon"><i class="fas fa-home"></i></span>
                        <span class="item">Home</span>
                    </a>
                </li>
                <li>
                    <a href="https://chizobaonorh.github.io/labs-prototypes/seeds/cloud-function/">
                        <span class="icon"><i class="fas fa-desktop"></i></span>
                        <span class="item">My Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-user-friends"></i></span>
                        <span class="item">People</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span class="item">Perfomance</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-database"></i></span>
                        <span class="item">Development</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span class="item">Reports</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-user-shield"></i></span>
                        <span class="item">Admin</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class="fas fa-cog"></i></span>
                        <span class="item">Settings</span>
                    </a>
                </li>
            </ul>
        </div>
        <p>
            <h2>What is front matter?</h2><br>
            Front matter is the first section of a book and is generally the shortest; it is also sometimes called the prelims, or preliminary matter. It can be as simple as a single title page, or it can include multiple title pages, foreword, a preface, and much more. What is included in front matter really depends on the type of publication, so let's go over some of the possibilities.
            Examples of front matter <br>
            Half title: A half title is a page that has only the main title of the publication. The subtitle and author’s name are omitted in this page of the front matter.<br>
            Title page(s): A title page has, at a minimum, the full title of the work, including the subtitle (if any), and the name of the author and—if applicable—illustrator. Everything else depends on the type of book, but may include:<br>
            Publisher’s name and address
            Copyright information
            ISBN
            Edition notice
            Date of publication
            Number of printings
            Disclaimers
            Warranties
            Safety notices
            Dedication: A dedication is a part of the front matter that is written by the author and includes the names of the person/persons for whom the publication was written.
            Epigraph: An epigraph is a quotation included by the author that is relevant but not essential to the text.
            Table of Contents: A table of contents is typically in the middle of the front matter. It may be a very simple listing of what is in the book, or it may be very detailed and include descriptions of each chapter or section.<br> <br>
            Front matter is the first section of a book and is generally the shortest; it is also sometimes called the prelims, or preliminary matter. It can be as simple as a single title page, or it can include multiple title pages, foreword, a preface, and much more. What is included in front matter really depends on the type of publication, so let's go over some of the possibilities.
            Examples of front matter <br>
            Half title: A half title is a page that has only the main title of the publication. The subtitle and author’s name are omitted in this page of the front matter.<br>
            Title page(s): A title page has, at a minimum, the full title of the work, including the subtitle (if any), and the name of the author and—if applicable—illustrator. Everything else depends on the type of book, but may include:<br>
            Publisher’s name and address
            Copyright information
            ISBN
            Edition notice
            Date of publication
            Number of printings
            Disclaimers
            Warranties
            Safety notices
            Dedication: A dedication is a part of the front matter that is written by the author and includes the names of the person/persons for whom the publication was written.
            Epigraph: An epigraph is a quotation included by the author that is relevant but not essential to the text.
            Table of Contents: A table of contents is typically in the middle of the front matter. It may be a very simple listing of what is in the book, or it may be very detailed and include descriptions of each chapter or section.
        </p>
    </div>
  <script>
         var hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", function(){
        document.querySelector("body").classList.toggle("active");
    })
  </script>
</body>
</html>