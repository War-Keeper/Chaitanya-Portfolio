var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/War-Keeper/Chaitanya-Portfolio.git', // Update to point to your repository  
        user: {
            name: 'Chaitanya Patel', // update to use your name
            email: 'thechikkipatel@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)