// See the image received from the server, including its title, likes and comments when the page loads
//fetch the image and image data
const imageUrl = 'http://localhost:3000/images';
const commentsUrl = 'http://localhost:3000/comments';
const headers = {
    'Content-Type':'application/json',
    Accept:'application/json'
};
const commentsList = document.querySelector('ul.comments');

getImages();

function getImages()
{
    fetch(imageUrl)
    .then(res => res.json())
    .then(displayImages).catch(console.log);
}

function displayImages(images)
{
    //need to loop through since images are in an array, 
    //and in the future might be more than one image
    images.forEach(image => displayImage(image)); 
}

//get the image element
//fill out the image card with the appropriate image data
function displayImage(image)
{
    const imageCard = document.querySelector('div.image-card');
    imageCard.querySelector('h2').innerText = image.title;
    imageCard.querySelector('img').src = image.image;
    imageCard.querySelector('span.likes').innerHTML = image.likes;
    
    // Click on the heart icon to increase image likes, and still see them when I reload the page
    //get like button element and add event listener
    imageCard.querySelector('button.like-button').addEventListener('click', () => {
        const value = 1;
        updateLikes(image, value);
    });
    
    //get comments
    fetch(commentsUrl)
    .then(res => res.json())
    .then(comments => {
        let imageComments = comments.filter(comment => comment.imageId == image.id);
        commentsList.innerHTML = '';
        //update image with comments
        imageComments.forEach(comment => {
            commentHelper(comment.content);
        });
    });

    //downvote an image
    //create a downvote button
    const downVoteButton = document.querySelector('button.dislike-button');
    downVoteButton.addEventListener('click', () => {
        const value = -1;
        updateLikes(image, value)
    });
    //get likes section to add to
    // const likesDiv = imageCard.querySelector('div.likes-section');
    // likesDiv.appendChild(downVoteButton);

    //add persistent comments
    const commentForm = document.querySelector('form.comment-form');
    commentForm.addEventListener('submit', (event) => {
        addComment(event, image)
        });
}

function updateLikes(image, value)
{
    image.likes = image.likes + value;
    const singleImageUrl = `${imageUrl}/${image.id}`;
    //make a patch request to update the image likes in the db
    fetch(singleImageUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({likes: image.likes})
    })
    .then(res => res.json())
    .then(getImages)
}

//Add a comment (no persistance needed)
//get comment box and add event
// const commentForm = document.querySelector('form.comment-form');
// commentForm.addEventListener('submit', addComment);

function addComment(event, image)
{
    event.preventDefault();

    const newComment = {
        content: event.target.comment.value,
        imageId: image.id
    }
    //make a post request to add new comment to image in the db
    fetch(commentsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(newComment)
    })
    .then(res => res.json())
    .then( (json) => {
        event.target.comment.value = '';
        console.log(json);
    }
    );

    // commentHelper(event.target.comment.value);

}

function commentHelper(commentText)
{
    const commentLi = document.createElement('li');
    commentLi.innerText = commentText;
    commentsList.appendChild(commentLi);
}

