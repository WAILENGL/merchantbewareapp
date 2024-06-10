# Merchant Beware - an early warning app for Shopify Merchants

## Introduction

Merchant Beware is a Shopify app developed to help independent Shopify stores detect potentially problematic customers and to make informed decisions on whether to do business with them. Information on bad customers is shared to a central database, which then alerts other stores when that customer makes an order elsewhere.

## User Stories

These are the user stories that guided the development of our project:

- As a user, I want to be able to log into the app from Shopify
- As a user, I want to be able to add a bad customer to the database via the Shopify backend, and have him/her be tagged as such when they make an order on the store
- As a user, I want to be able to create a report about my bad customer on the database.
- As a user, I want to be able to search for information on bad customers from the database.

## Technologies and Tools Used

#### Languages

- HTML
- CSS
- JavaScript

#### Frameworks

- React.js
- Node.js
- Express.js

#### Libraries

- Polaris Component Library

#### Database

- MongoDB

#### Tools

- Figma (Wireframe)
- Trello (Public Board)
- Render (Online Deployment)
- Shopify CLI
- Git and Github
- Visual Studio Code
- Vite

## Technical Description

- A MERN stack app
- Two Data Models
- Data operations including CREATE, READ, UPDATE, and DELETE
- Deployed online

## Development Process

1. I explored the feasibility of doing a Shopify App using the Mern Stack
2. Once that was determined to be possible, I checked for app templates to study how Shopify apps should be developed.
3. Initially, I made the error of deciding to do a Mern website using data pulled from Shopify's store apis
4. After a really painful process of trying to make Shopify's apis work externally, I joined a Shopify Developer Discord to seek help.
5. With their help, I managed to figure out how to work with Shopify's app template.
6. I set up some GET endpoints for customer and order information and managed to get them to display within the app.
7. I then studied the Polaris library to quickly do up the UI for the app with the information.
8. Set up the MongoDB database for the app
9. Created CRUD functions to create, update and delete reports
10. Created search functions within the app along with UI and QOL features.

## Getting Started

[Deployed App](https://merchantbewareapp.onrender.com/) - Please note that the app can only be accessed from within the Shopify Admin at merchantbeware.myshopify.com/admin.

#### Wireframe

[Figma](https://www.figma.com/board/IHQ2Q2X0X0ExJtFgtCE8j1/MerchantBeware-Flow?t=Wlj8PpanlCohK2FI-0)

#### Project Planning

[Trello](https://trello.com/b/eH5ZItmM/merchantbeware)

## Screenshots

Landing Page

![Landing Page](https://github.com/WAILENGL/3DWonders/blob/main/images/Landing%20Page.png)

Login Page
![Login Page](https://github.com/WAILENGL/3DWonders/blob/main/images/login%20page.png?raw=true)

## Next Steps

- Refactor and optimize code
- Add Settings for users to customize how they want their customers to be tagged
- Add an Admin cms to manage reports and customers in case of GDPR data requests
- Look into data protections needed to publish the app publicly

## Experience Summary

## Acknowledgments

I would like to thank the community from the Shopify Developer's Discord, who patiently helped me with getting started on the Shopify app node template and explaining how to work with it. To my GA instructor Simon, who supported me in developing this app and provided guidance through the course. And of course, to my classmates in GA who played a part in my learning and helped when I was stuck, either with practical or moral support.
