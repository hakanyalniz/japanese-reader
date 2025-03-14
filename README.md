# Japanese Reader

#### Video Demo: <[URL](https://www.youtube.com/watch?v=uUgGWqLjYhQ)>

## Introduction

Japanese Reader is a website that allows users to upload epub files, navigate them through keyboard arrow keys or mouse/touch gestures, lookup unknown words, add these words to a notebooks page and finally, send them to Anki for review.

It was created with vite, uses React with TypeScript for Frontend and Flask with sqlite for backend.

For Anki, it uses [AnkiConnect](https://git.sr.ht/~foosoft/anki-connect) for the Anki local API, allowing us to send and manipulate the Anki software.

## How to use

Using the website is simple and straightforward. First, the user must open Anki and install AnkiConnect so that we can send cards over. Next, they must open the website and add a Japanese epub book of their choice. They can navigate the book by their keyboard arrow keys or mouse swipe gestures. The user can also use touch to move the book, but currently it is not possible to send anki cards to mobile users due to limitations. This will be solved in a later update.

Clicking on a kanji or kana will make the kanji box pop up. The unknown words are listed here along with their kana and meaning. Clicked the add button here will send the word to the Notebooks page. There, the user can look up all of the words they have sent over, delete them if they wish to and finally, send all of the cards to Anki for review and study.

We also plan to add more feautures in the future. Such as allowing the user to download the contents of Notebook via apkg file so that you can later on import it via Anki. Add a dictionary page, where the user can lookup words by typing them out. Add a themes option, to make the website look unique and interesting and so on.

## How it works

Let us go over the files and the design logic within the program.

### Flask

First, we have the flask_backend folder. This folder contains the backend logic for the website, primarily, it allows us to lookup words from the dictionary. The dictionary of choice we have downloaded is [jmdict](https://github.com/scriptin/jmdict-simplified/releases). It contains kanji, kana and examples that can be pulled if we so desire. A init_db.py file was used to initialize the sqlite3 database, other than that, there is also the app.py. Here we handle the requests from frontend, process them, and return the requested data from the SQL database.

### Components

#### Old Components

We have some old components that are now unused, but still remain in the project just in case. These are the Footer and SidePanel components. We decided to not use Footer, because without it the website looks more sleek, not to mention that it sometimes got in the way of reading the books. As for the SidePanel, we had used it for most of the project development cycle and it worked pretty well. It used to show the dictionary content, the word meanings and readings and so on. But when we reached the responsive design phase of our project, things started getting frustrating and annoying. The SidePanel would get in the way, not work as intended, make it hard to read the content (both the book itself and the dictionary content). Later on we decided to replace it with the KanjiBox component, which works way better.

#### KanjiBox

The next component is the above mentioned KanjiBox. It takes two arguments: currentRendition and foundDictionaryData. currentRendition is from epubjs library, which we will talk more later. It allows us to attach and eventlistener to the iframe, allowing us to take mouse position via clicks. Meanwhile, foundDictionaryData contains the dictionary content we want to display. We will get into the details of this variable and more later.

The important part in KanjiBox is the way we get the position of the mouse. The way epubjs handled pagination was a key problem here, which is by increasing width as much as needed then putting the pages into the created large width space and as we move within the book, move the user within the space. Due to this, trying to use clientX gave nonsense values, which caused KanjiBox to appear offscreen. To fix this we subtracted the nonsense value by iframe's clientX value and further subtracted that by the margin value of the container. This allowed the KanjiBox to appear where the user clicked the screen.

We had a few other ways of fixing this, but ended up using this one after we tried many other methods, all of which didn't work for one reason or another.

#### NavBar

There isn't much to say here. Just an ordinary NavBar.

### Layouts

We had not used the Router layouts way of creating a project before, but it was really straightforward. It makes use of <Outlet \/>, which is where the child components are rendered in.

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} /> // The child components
          <Route path="notebook" element={<Notebook />} />
        </Route>
      </Routes>
    </BrowserRouter>

### Store

We make use of Redux in this project, because a few instances required a top level state to be given as prop to some components. Because we were also making use of Layouts, making use of Redux was the only option and it was also the cleaner option. There are two variables in the store: dictionaryHistory and currentlyDisplayedEpub. dictionaryHistory variable is used in Notebook page to list the words we have clicked Add on in KanjiBox. It contains the dictionary type, which itself contains the kanji information, such as its reading and so on. currentlyDisplayedEpub variable contains the metadata for the epub book the user clicked Add Book on. This is needed so that when the user clicks on another page and returns to the book, the book doesn't dissappear. We can do this by reconstructing the book from the metadata stored in currentlyDisplayedEpub.

### Styles

Nothing new or interesting here. Just some CSS styles.

### Types

Creating interfaces and types can quickly get out of hand and make the program look messy and hard to maintain. Because of this reason I have collected all of the types in one file, which is the global.d.ts file.

### Pages

#### Home

This page and file is where all of the logic from helpers.tsx (which we will talk about in a minute) is gathered and executed in a proper manner. It is basically where most of the action takes place. Because of this, the file was getting too big big and complex, so we broke it apart and placed most of the logic in helpers.tsx. Therefore, if we want to talk about what happens in Home page, and the logic of the website itself, then we need to talk about the helpers.tsx file. Which we will do so at the end.

#### Notebook

This page displays dictionaryHistory variable, allowing the user to look at all of the kanji they have added via the Add button in the KanjiBox. It also allows them to Delete them if they wish to and more importantly, send them to Anki for study and review.

### Helpers

The bulk of the logic in the program is placed in the helpers.tsx file. Now that we take a look back, it was a poor design choice to place everything here. It would had been better to break up the file even more and perhaps we might just do that later on. We will now go over the functions and code within the helpers file and briefly explain what they do.

#### handleAddEbook

The input form is made invisible for style reasons, so we click and access it through this function instead.

#### handleFileInput

Takes file input, open the epub file received, display it via the epubjs library. Registers themes and additional settings.
f the user has already opened an epub file previously, save the metadata and if the remove button hasn't yet been clicked,
use the metadata to load the epub again. This function runs when the file input element changes, as in, an input is entered.

#### storeFileMetaData

Store ebook metadata for later use in reconstructing it if the user returns to the page after leaving it.

#### base64ToFile

Store ebook data field metadata as base64, when the time to use it comes, turn it back to file using the data metadata and other metadata already collected.

#### handleRemoveEbook

Clear the EPUB content and reset the viewer.

#### handleKeyDown

Navigate pagination via keyboard arrow keys while the focus is outside of the IFrame.

#### handleIFrameKey

Navigate pagination via keyboard arrow keys while the focus is inside of the IFrame.

#### handleNextPage

Handle pagination control next page via HTML button.

#### handlePrevPage

Handle pagination control previous page via HTML button.

#### getClickedKanji

Get the kanji/character the user clicked on, alongside the sentence in which that character appeared.

#### handleDataFetching

Fetch data from Flask.

#### loopSearchDict

Loops through the clicked character and all the way through the rest of the sentence and searches them inside the dictionary data.
Starts from the clicked character location, if found adds it at setFoundDictionaryData, then moves onto the next character in the sentence,
and adds that character, and the previous character, together. Searches that aswell. Loops through the sentence in this manner, searching for
word combinations.

Example:

引きこもり

clickedQuery is 引.

currentWordBeingSearched is 引.

Searches the currentWordBeingSearched in dictionaryData, then moves onto the next character, adding き into currentWordBeingSearched.

Now currentWordBeingSearched is 引き, searches this in the dictionaryData aswell. And so on.

#### safeResize

Resizes the IFrame that displays epub. A replacement for the official rendition.resize method.

#### handleResize

Resize the epub font to make it more responsive.

#### swipeStartHandler

Records the current pageX and pageY coordinates through MouseEvent or TouchEvent.

#### swipeEndHandler

Records the end point of the pageX and pageY coordinates. Subtracts them from the start coordinates and decides swipe direction according to result.

#### deckExists

Checks if a deck exists or not.

#### createDeckIfNotExists

Creates a deck if it doesn't exist already.

#### addCardToDeck

Adds cards to the deck, creates a deck if it doesn't exist already.

#### invokeAnkiConnect

Communicates with the AnkiConnect local API by executing commands.
