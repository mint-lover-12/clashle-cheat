install tampermonkey from https://chromewebstore.google.com/   (look up tampermonkey), and then make a new script and paste in the contents of `index.js`
then go to clashle (`https://objectivitix.github.io/`). gui pops up, and you can farm. avg is 2 guesses per win. 

example stats (1|1 speed settings, just using bot and reloading page)


<img width="275" height="269" alt="image" src="https://github.com/user-attachments/assets/8ef62bc1-93db-45c5-913d-814e944d4ee4" />


**technical**
clashle (wordle) is a very simple game, so cheating in it is easy.
I needed a: CardList (obtained from clash API), and then I can just detect the:
Length of the word: Lets you cut out 80% of cards, then it guesses the first card on the list, which cuts out the other 19% of cards, leaving one or two left. From there it just does its thing, i dont think its possible to get >3 guesses. For reference, theres a higher chance (in 100 goes) of getting it in one go than getting it in 3...
It also corrects itself automatically, if the user inputs something it'll delete it and rewrite the word. 

very simple cheat to make in general, works very efficiently. could probably add auto reloading, but I dont want to get banned from github for spamming serverd so we'll see. 


if clashle adds next game button ill add autoplay, you could probably get at least 10000 wins a day. 
-   site hasnt been updated in 3 years, dont think this is happening.
-   Also might make a cheat for royaldle, who knows
