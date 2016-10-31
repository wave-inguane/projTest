Our 4 scenarios are as follows:
 
1) Registration (and login). This is done by storing user account info in the firebase database.
 
2) Browse Games by category. (xbox, pc, etc).
 
3) Search Games by keywords.  Users can select the name, platform, and possibly more keywords in the future.
 
4) View Games (either text popup on hover or new page). A list of games will be output depending on user search criteria.  A user should be able to view these games if they wish. Viewing a game will ultimately have a list of retailors and their prices for that game, allowing quick comparison.  This will likely contain our visualization in the future, perhaps showing graphs of statistics about the games (for example, popularity of the game among different platforms.)


The three scenarios we have currently implemented are:

1) Registration and login.

2) Search Games by keywords

3) Browse games by platform (xbox, pc, playstation, etc) (NOTE: We need to optimize the search for this, the reuslts are not nearly as good as we want them) (Second Note: When switching from search to browse, we need to make it so that a previously displayed search result disappears).

//HOMEWORK 5

4) View games / compare game prices.  After searching for games, users can click on a game to see the prices of that game at both amazon and best buy.  This also shows a visualization, highlighting how good one price is compared to the other.

We also added react code for registration and login, now messages such as "successful login" or "incorrect email/password" are displayed via react.

NOTE: depending on a search, several to alot of the best buy prices can have no data because there was no matching game found.  "sonic" is a good search, we found that 9/10 of it's results had a best buy match.


NOTE: To use search capability, there is origin error. The google chrome plugin Allow-Control-Allow-Origin will fix this for now.
https://chrome.google.com/webstore/search/Allow-Control-Allow-Origin




WEBSITE:
https://frozen-meadow-97870.herokuapp.com


