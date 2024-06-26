# Merchant Beware - an early warning app for Shopify Merchants

## Introduction

Merchant Beware is a Shopify app developed to help independent Shopify stores detect potentially problematic customers and to make informed decisions on whether to do business with them. Information on bad customers is shared to a central database, which then alerts other stores when that customer makes an order elsewhere.

## Background

Merchant Beware is the app I've always wanted for my ecommerce stores. Over my 7 years in ecommerce, I've encountered many unreasonable customers and instances of friendly fraud through credit card chargebacks. Credit card companies are often slow to alert merchants about potentially fraudulent transactions, sometimes only notifying me weeks after I’ve shipped the product.

An early warning system for problematic customers is invaluable for independent ecommerce shops. Major platforms like Amazon and Shopee ban users who file chargebacks and have customer review systems that alert sellers about troublesome buyers. Merchant Beware aims to leverage data shared by independent shops to help identify and protect against customers who use a lack of data to exploit small online businesses.

## User Stories

These are the user stories that guided the development of our project:

- As a user, I want to be able to log into the app from Shopify
- As a user, I want to be able to add a bad customer to the database via the Shopify backend, and have him/her be tagged as such when they make an order on the store
- As a user, I want to be able to create a report about my bad customer on the database
- As a user, I want to be able to edit or delete a report about my bad customer if circumstances change
- As a user, I want to be able to search for information on bad customers from the database
- As a user, I want customers automatically added to the database based on certain criteria

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
11. Refactored code

## Getting Started

[Deployed App](https://admin.shopify.com/store/merchantbeware/apps/merchantbeware) - Please note that the app can only be accessed from within the Shopify Admin and requires a staff login for the development store.

#### Wireframe

This was the original wireframe for the project. As the project evolved, the UI and some features had to be adjusted. For example, a login form and logout button wasn't required as the app is accessed from within Shopify. However, the main features generally remained the same.

[Figma](https://www.figma.com/board/IHQ2Q2X0X0ExJtFgtCE8j1/MerchantBeware-Flow?t=Wlj8PpanlCohK2FI-0)

#### Project Planning

[Trello](https://trello.com/b/eH5ZItmM/merchantbeware)

## Screenshots

**Home Page**

A page that explains how the app is used and links to the 3 main pages needed to use the app

![Home Page](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Home-Page.jpg?raw=true)

**Database Search**

This is the page that searches the central MongoDB database which will contain information on customers that other stores share information about, even if the customer hasn't shopped at your store.

![Database Search](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Database-Search.jpg?raw=true)

**Customer Search**

This page allows you to find your own customers and create or edit reports about them.

![Customer Search](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Your-Customers.jpg?raw=true)

**Order Search**

This page allows you to search your orders and create or edit reports about the customers who made them.

![Order Search](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Search-Orders.jpg?raw=true)

**Create Report Page**

This page allows users to create reports on customers. The customer's name, email and address are pre-filled in to minimise errors and potential for abuse.

![Create Bad Customer Report](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Create-Report.jpg?raw=true)

**Edit/Delete Report Page**

This page allows users to edit and update reports, as well as delete them.

![Edit/Delete Bad Customer Report](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Edit-Report.jpg?raw=true)

**Automatic Bad Customer Tags**

When a customer is marked a bad customer, the "bad customer" tag is added to the order whenever the customer tries to make an order on the store. This alerts the merchant to check for reports on the customer and determine if they want to do business with them.

![Bad Customer Tag on Orders](https://github.com/WAILENGL/merchantbewareapp/blob/main/Images/Bad-Customer-Tags-on-orders.jpg?raw=true)

## Next Steps

- Optimize code and future-proof it
- Add Settings for users to customize how they want their customers to be tagged
- Add customized tags for different bad customer interactions (Excessive Refunds, Recent Multiple Chargebacks etc)
- Add an Admin cms to manage reports and customers in case of GDPR data requests
- Look into data protections needed to publish the app publicly

## Key Learnings & Challenges

**How to Create a Shopify App from Scratch Using MERN**

The process of learning to apply what I learnt about the MERN stack in class to the Shopify app template reinforced my understanding of development with MERN technologies and expanded my view of what is possible even at this point in my journey as a developer.

A crucial aspect of building a Shopify app is learning to use the Shopify app libraries and APIs. These tools facilitate secure authentication, data retrieval, and manipulation of store data. Understanding how to work with Shopify's API endpoints allows for efficient handling of orders and customer data, which are crucial to the functioning of the app.

**The importance of planning**

Because I switched to using the Shopify app template halfway, it caused me to deviate from my original plans and resulted in quite a bit of wasted work. This reinforced for me the importance of planning in ensuring that unexpected/unintended problems didn't come up down the road.

**Issues with Limited Testing Conditions**

As the app needs to read data which is protected, such as customer data, Shopify requires developers to seek approval for such api scopes if it's installed on multiple stores. Such approval takes up to 7 working days and as of presentation day, is still pending. This limited me to using the app on one store, so it was difficult to test code for data that would be shared by multiple users. Once the app can be installed on multiple stores, I expect to modify the code further.

## Experience Summary

This project was the most difficult, yet enjoyable one I've done during my time in General Assembly. Using the Mern Stack knowledge I learnt during the course to create a Shopify app was in a way confirmation that I could apply my skills to practical projects.

The biggest challenges I faced during the project mostly had to do with learning to work with Shopify's node App template and Shopify's apis. Because I had initially no idea what was possible, I spent the first week setting up an OAuth flow to pull data into an external site. The repo containing that week's work can be seen here: https://github.com/WAILENGL/merchantbeware.

The breakthrough came when I joined a Shopify Developers' Discord, where I could ask a community of more experienced developers how to work with Shopify's APIs, and they helped me get started with the node app template. This reinforced how important communities are to development, even with good documentation for a platform's APIs and templates.

Even then, every step was stll a challenge - from having to adapt what I'd planned and worked on to the app template to deployment on Render. Render's documentation assumed that developers use the Remix template for Shopify apps, and I had to figure out how the Remix template's configuration differed from the node template's to deploy the app with very little discussion or help available from other developers, as they did not have the same set up/configuration.

Ultimately, as frustrating as the experience can be, nothing beats the satisfaction of seeing the final, working result. Doing projects in GA has certainly whetted my appetite for creating websites and apps that can be useful to people.

## Acknowledgments

I would like to thank the community from the Shopify Developer's Discord, who patiently helped me with getting started on the Shopify app node template and explaining how to work with it. To my GA instructor Simon, who supported me in developing this app and provided guidance through the course. And of course, to my classmates in GA who played a part in my learning and helped when I was stuck, either with practical or moral support.
