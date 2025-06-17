// This code will only run after the entire HTML page has loaded.
document.addEventListener('DOMContentLoaded', function () {

    // =============================================
    // 1. ACCESSIBILITY & THEME CONTROLS
    // =============================================
    // This section handles Dark/Light mode and font resizing controls.
    
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const htmlElement = document.documentElement; // The <html> tag

    // --- Function to apply a theme (dark/light) ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggle) themeToggle.checked = false;
        }
    };

    // This code runs when the theme toggle button is clicked
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                localStorage.setItem('theme', 'dark'); // Saves user's choice
                applyTheme('dark');
            } else {
                localStorage.setItem('theme', 'light');
                applyTheme('light');
            }
        });
    }

    // --- Function to handle font resizing ---
    const applyFontSize = (size) => {
        htmlElement.style.fontSize = size;
    };
    
    const changeFontSize = (amount) => {
        let currentSize = parseFloat(getComputedStyle(htmlElement).fontSize);
        let newSize = currentSize + amount;
        // Set limits to prevent font from becoming too small or too large
        if (newSize >= 12 && newSize <= 22) {
            const newSizePx = newSize + 'px';
            applyFontSize(newSizePx);
            localStorage.setItem('fontSize', newSizePx); // Saves font size choice
        }
    };
    
    // Add click events to font size buttons
    if(increaseFontBtn) increaseFontBtn.addEventListener('click', () => changeFontSize(1));
    if(decreaseFontBtn) decreaseFontBtn.addEventListener('click', () => changeFontSize(-1));

    // --- Apply saved settings (theme, font size) when the page loads ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFontSize = localStorage.getItem('fontSize');
    
    applyTheme(savedTheme);
    if (savedFontSize) {
        applyFontSize(savedFontSize);
    }


    // =============================================
    // 2. ARTICLE ARCHIVE FEATURE
    // =============================================
    // This code saves articles the user has read into a "News Archive".

    const articleLinks = document.querySelectorAll('a[href$=".html"]');

    const archiveArticle = (event) => {
        const linkElement = event.target.closest('a[href$=".html"]');
        if (!linkElement) return;

        // Get the article title from various heading tags or paragraphs
        const titleElement = linkElement.querySelector('h1, h2, h3, .headline');
        let articleTitle = 'Untitled Article';
        if (titleElement) {
            articleTitle = titleElement.textContent.trim();
        } else {
             // As a fallback, use the link's text content
             articleTitle = linkElement.textContent.trim().split('\n')[0];
        }

        const articleLink = linkElement.href;
        
        // Don't save if the title is empty or too short
        if (!articleTitle || articleTitle.length < 5) return;
        
        // Get the existing archive from the browser's Local Storage
        let newsArchive = JSON.parse(localStorage.getItem('newsArchive')) || [];

        // Check if this article is already archived
        const isAlreadyArchived = newsArchive.some(item => item.link === articleLink);

        if (!isAlreadyArchived) {
             const articleToSave = {
                title: articleTitle,
                link: articleLink,
                readDate: new Date().toISOString() // Save the current date and time
            };
            newsArchive.push(articleToSave);
            localStorage.setItem('newsArchive', JSON.stringify(newsArchive));
        }
    };

    // Add a click event listener to every article link
    articleLinks.forEach(link => {
        // Exclude utility links like login, subscription, etc.
        if (!link.href.includes('login.html') && !link.href.includes('subscription.html')) {
             link.addEventListener('click', archiveArticle);
        }
    });


    // =============================================
    // 3. ARTICLE BOOKMARKING FUNCTIONALITY
    // =============================================
    // This is the code for the bookmarking feature. It saves articles for later reading.
    const bookmarkIcons = document.querySelectorAll('.bookmark-icon');
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

    const updateIconState = (icon) => {
        const articleId = icon.dataset.id;
        const isBookmarked = bookmarks.some(b => b.id === articleId);

        if (isBookmarked) {
            icon.classList.add('bookmarked', 'fa-solid'); // Makes the icon solid (filled)
            icon.classList.remove('fa-regular');
            icon.title = 'Remove from bookmarks';
        } else {
            icon.classList.remove('bookmarked', 'fa-solid');
            icon.classList.add('fa-regular'); // Makes the icon regular (outline)
            icon.title = 'Bookmark this article';
        }
    };

    const toggleBookmark = (event) => {
        const icon = event.target;
        const articleId = icon.dataset.id;
        const articleTitle = icon.dataset.title;
        const articleLink = icon.dataset.link || '#';

        const bookmarkIndex = bookmarks.findIndex(b => b.id === articleId);

        if (bookmarkIndex > -1) {
            bookmarks.splice(bookmarkIndex, 1); // If it's already there, remove it
        } else {
            bookmarks.push({ id: articleId, title: articleTitle, link: articleLink }); // Otherwise, add it
        }
        
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        updateIconState(icon);
    };
    
    // Add event listeners to all bookmark icons and set their initial state
    bookmarkIcons.forEach(icon => {
        updateIconState(icon); 
        icon.addEventListener('click', toggleBookmark);
    });

    

    // --- "On This Day" Widget ---
    // The data for the historical events widget.
    const onThisDayEvents = {
        // Data for June with Indian History focus
        "06-01": ["1930 – The Deccan Queen, India's first deluxe train, begins its service between Pune and Mumbai (then Bombay).", "1967 – The Beatles release their iconic album 'Sgt. Pepper's Lonely Hearts Club Band'."],
        "06-02": ["1953 – The coronation of Queen Elizabeth II takes place; she was the last reigning monarch of the Dominion of India.", "2014 – Telangana is officially formed as the 29th state of India."],
        "06-03": ["1947 – Lord Mountbatten announces the plan for the partition of British India into India and Pakistan.", "1965 – Astronaut Ed White performs the first American spacewalk during the Gemini 4 mission."],
        "06-04": ["1989 – The Tiananmen Square protests are violently suppressed in Beijing by the Chinese government.", "2001 – King Gyanendra of Nepal ascends to the throne after the Nepalese royal massacre."],
        "06-05": ["1984 – Operation Blue Star begins as Indian army troops storm the Golden Temple complex in Amritsar.", "1947 – U.S. Secretary of State George Marshall outlines the 'Marshall Plan' to rebuild Western Europe."],
        "06-06": ["1674 – Chhatrapati Shivaji Maharaj is coronated as the king of the Maratha Empire at Raigad Fort.", "1944 – D-Day: Over 156,000 Allied troops land on the beaches of Normandy, France."],
        "06-07": ["1979 – Bhaskara-I, an Indian satellite built by ISRO, is launched, marking a milestone in India's space program.", "1991 – Mount Pinatubo in the Philippines erupts, in the second-largest terrestrial eruption of the 20th century."],
        "06-08": ["1936 – The Indian State Broadcasting Service is renamed 'All India Radio'.", "1948 – The first Air India international flight takes off from Mumbai to London."],
        "06-09": ["1964 – Lal Bahadur Shastri becomes the second Prime Minister of India, following the death of Jawaharlal Nehru.", "68 AD – Roman Emperor Nero commits suicide."],
        "06-10": ["1940 – Italy declares war on France and the United Kingdom, entering World War II.", "1999 – India launches a major offensive in Kargil (Operation Vijay) to recapture Tololing peak from intruders."],
        "06-11": ["1897 – Ram Prasad Bismil, a key figure in the Indian independence movement, is born.", "1963 – Buddhist monk Thích Quảng Đức self-immolates in Saigon to protest religious persecution."],
        "06-12": ["1975 – The Allahabad High Court finds Prime Minister Indira Gandhi guilty of electoral malpractice, leading to a political crisis.", "1964 – Anti-apartheid leader Nelson Mandela is sentenced to life in prison in South Africa."],
        "06-13": ["1997 – The Uphaar Cinema fire tragedy occurs in New Delhi, claiming 59 lives during a movie screening.", "1966 – The U.S. Supreme Court rules in 'Miranda v. Arizona' on the rights of suspects in custody."],
        "06-14": ["1940 – German forces enter and occupy Paris during World War II.", "2001 – The group of ministers in India formally approves a proposal for a Value Added Tax (VAT) system."],
        "06-15": ["1215 – King John of England is forced to sign the Magna Carta, a foundational charter of rights.", "1947 – The All India Congress accepts the British plan for the partition of India."],
        "06-16": ["1925 – Chittaranjan Das, a leading figure in Bengal during the Indian independence movement, passes away.", "1963 – Valentina Tereshkova becomes the first woman in space."],
        "06-17": ["1631 – Mumtaz Mahal, wife of Mughal emperor Shah Jahan, dies during childbirth. Her death inspired the construction of the Taj Mahal.", "1972 – The Watergate break-in occurs, leading to a major political scandal in the U.S."],
        "06-18": ["1858 – Rani Lakshmibai of Jhansi, a key leader of the Indian Rebellion of 1857, dies in combat against British forces.", "1815 – Napoleon Bonaparte is defeated at the Battle of Waterloo."],
        "06-19": ["1970 – Rahul Gandhi, prominent Indian politician, is born in New Delhi.", "1865 – Juneteenth: Union soldiers bring news of freedom to enslaved African Americans in Galveston, Texas."],
        "06-20": ["1887 – The Victoria Terminus (now Chhatrapati Shivaji Maharaj Terminus) railway station in Mumbai is opened to the public.", "1975 – The blockbuster film 'Jaws' is released, defining the modern blockbuster."],
        "06-21": ["2015 – The first International Day of Yoga is celebrated worldwide after its proposal by Indian PM Narendra Modi at the UN.", "1948 – The first practical stored-program computer runs its first program."],
        "06-22": ["1897 – The Chapekar brothers assassinate British colonial officer W. C. Rand in Pune, an event in the Indian revolutionary movement.", "1941 – Germany invades the Soviet Union under Operation Barbarossa."],
        "06-23": ["1757 – The Battle of Plassey is fought, leading to the victory of the British East India Company over the Nawab of Bengal and laying the foundation for British rule in India.", "2016 – The United Kingdom votes to leave the European Union (Brexit)."],
        "06-24": ["1961 – The first Indian-made supersonic fighter jet, the HAL HF-24 Marut, makes its maiden flight.", "1948 – The Soviet Union begins the Berlin Blockade, a major Cold War crisis."],
        "06-25": ["1975 – The Emergency is declared in India by Prime Minister Indira Gandhi, suspending civil liberties for 21 months.", "1983 – The Indian cricket team, led by Kapil Dev, wins its first Cricket World Cup, defeating the West Indies."],
        "06-26": ["1945 – The United Nations Charter is signed, with India as one of the founding members.", "2015 – The Smart Cities Mission is launched by the Government of India."],
        "06-27": ["1839 – Maharaja Ranjit Singh, founder of the Sikh Empire, passes away in Lahore.", "1954 – The world's first nuclear power station begins operation in the Soviet Union."],
        "06-28": ["1919 – The Treaty of Versailles is signed, formally ending World War I.", "1921 – P. V. Narasimha Rao, former Prime Minister of India known for ushering in economic reforms, is born."],
        "06-29": ["1893 – P. C. Mahalanobis, renowned Indian scientist and statistician who founded the Indian Statistical Institute, is born.", "2007 – Apple Inc. releases the first iPhone, revolutionizing the mobile phone industry."],
        "06-30": ["1855 – The Santhal rebellion begins against the British East India Company and the zamindari system.", "1936 – Margaret Mitchell's epic novel 'Gone with the Wind' is published."],
        "01-01": ["1999 – Euro currency introduced.", "2000 – The world celebrates the start of a new millennium."]
    };





    
    // ▼▼▼ THIS IS THE CORRECTED & COMPLETED FUNCTION ▼▼▼
    function showOnThisDay() {
        const dateElement = document.getElementById('today-date');
        const listElement = document.getElementById('events-list');

        // Stop the function if the required HTML elements are not found.
        if (!dateElement || !listElement) {
            console.error("'On This Day' widget elements not found in the HTML.");
            return;
        }

        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Get month in MM format
        const day = String(today.getDate()).padStart(2, '0');       // Get day in DD format
        const key = `${month}-${day}`;                               // Create the key, e.g., "06-11"

        // Display today's full date for the user.
        dateElement.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        
        // Get today's events from the data object.
        const todaysEvents = onThisDayEvents[key];

        listElement.innerHTML = ''; // Clear the list before adding new items.

        if (todaysEvents && todaysEvents.length > 0) {
            // If events are found, create a list item for each one.
            todaysEvents.forEach(eventText => {
                const listItem = document.createElement('li');
                listItem.textContent = eventText;
                listElement.appendChild(listItem);
            });
        } else {
            // If no events are found for today.
            const listItem = document.createElement('li');
            listItem.textContent = "No historical events listed for today.";
            listElement.appendChild(listItem);
        }
    }
    
    // Call the function to populate the widget with data.
    showOnThisDay();






    // --- ye wala code button click pe page ke top pe jayega ---
    const backToTopButton = document.getElementById('backToTopBtn');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }






    // --- Lazy Loading for Images & Backgrounds ---
    const lazyElements = document.querySelectorAll('.lazy-img, .lazy-bg');
    if ("IntersectionObserver" in window) {
        const observerOptions = { root: null, rootMargin: '0px 0px 200px 0px', threshold: 0.01 };

        const lazyLoad = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.classList.contains('lazy-img')) {
                        element.src = element.dataset.src;
                    } else if (element.classList.contains('lazy-bg')) {
                        element.style.backgroundImage = element.dataset.bg;
                    }
                    element.classList.remove('lazy-img', 'lazy-bg');
                    observer.unobserve(element);
                }
            });
        };
        const observer = new IntersectionObserver(lazyLoad, observerOptions);
        lazyElements.forEach(element => observer.observe(element));
    } else {
        lazyElements.forEach(element => {
            if (element.classList.contains('lazy-img')) {
                element.src = element.dataset.src;
            } else if (element.classList.contains('lazy-bg')) {
                element.style.backgroundImage = element.dataset.bg;
            }
        });
    }
});