// poolt/vastu nuppude funktsionaalsus
function sendData() {
    var selectedVote = document.querySelector('input[name="vote"]:checked').value;
    fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: selectedVote }),
        credentials: 'include',
        redirect: 'follow'
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.text();
        }
    }).then(result => {
        if (result) {
            alert(result);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}


// hääletuse vastus confirmation lehele
document.addEventListener('DOMContentLoaded', function () {
    fetch('/get-vote')
        .then(response => response.json())
        .then(data => {
            document.getElementById('confirmationMessage').innerText = `Teie vastus "${data.vote}" on edukalt salvestatud! Soovite seda muuta?`;
        })
});


// eesnimi ja perenimi headerisse
document.addEventListener('DOMContentLoaded', function () {
    fetch('/get-username')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Not logged in');
        })
        .then(data => {
            document.getElementById('voter_name').textContent = data.name;
        })
        .catch(error => {
            console.error('Failed to fetch username:', error);
            document.getElementById('voter_name').textContent = 'Guest';
        });
});