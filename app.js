document.addEventListener('DOMContentLoaded', () => {

  // 1. Sticky Navbar & Scroll Effects
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Link Highlighting on Scroll
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // 2. Mobile Nav Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('open');
      
      // Update hamburger icon visual
      if (navToggle.classList.contains('open')) {
        navToggle.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else {
        navToggle.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
      }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('open');
        navToggle.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
      });
    });
  }

  // 3. Stats Count-Up Animation
  const statsElements = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // 1.8 seconds duration
    const startTime = performance.now();
    const isYear = target > 2000;
    const startValue = isYear ? 2000 : 0;

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: Out Quad
      const ease = progress * (2 - progress);
      const val = Math.floor(startValue + ease * (target - startValue));

      if (target === 71) {
        el.textContent = `${val}+`;
      } else {
        el.textContent = val;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target === 71 ? `${target}+` : target;
      }
    };

    requestAnimationFrame(update);
  };

  // 4. Scroll Reveal & Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Observer specifically for triggering stats count up
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsElements.forEach(animateCount);
        statsAnimated = true;
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Smooth Scrolling for anchor links (adjusting for sticky navbar height)
  // SPA Section Switcher Controller
  const views = {
    '#home': document.getElementById('home-view'),
    '#about': document.getElementById('about-view'),
    '#committees': document.getElementById('committee-view'),
    '#updates': document.getElementById('updates-view')
  };

  window.navigateToSection = function(targetHash) {
    if (!views[targetHash]) return;

    // 1. Switch visibility classes
    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.remove('active');
      }
    });
    views[targetHash].classList.add('active');

    // 2. Update Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      }
    });

    // 3. Trigger reveal transitions immediately on the newly opened page
    const reveals = views[targetHash].querySelectorAll('.reveal');
    reveals.forEach(el => el.classList.add('active'));

    // 4. Trigger stats counters animation if entering about view
    if (targetHash === '#about' && !statsAnimated) {
      setTimeout(() => {
        statsElements.forEach(animateCount);
        statsAnimated = true;
      }, 200);
    }

    // 5. Instant scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Intercept all anchor tag clicks matching SPA hashes or footer
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const hash = this.getAttribute('href');
      if (views[hash]) {
        e.preventDefault();
        window.navigateToSection(hash);
      } else if (hash === '#footer') {
        e.preventDefault();
        const footerElem = document.getElementById('footer');
        if (footerElem) {
          footerElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Global helper for navbar brand or footer redirects
  window.navigateToSectionGlobal = function(e, hash) {
    if (e) e.preventDefault();
    window.navigateToSection(hash);
  };

  // 5. Interactive Forum Body (Committees display mapping to PDF data)
  const committeesData = {
    technical: {
      title: "Technical Committee",
      tagline: "Drives coding hackathons and utility tool development",
      head: { name: "Gaurav Dhage", role: "Head Technical Committee" },
      coHeads: [
        { name: "Prathamesh Waghmare", role: "Co-Head" },
        { name: "Huzaifa Sheikh", role: "Co-Head" }
      ],
      members: ["Dhanshree Raut", "Sanchita Raut", "Ujjwal Dangare", "Vibhanshu Gajalkar", "Anshuman Zalke"]
    },
    event: {
      title: "Event Committee",
      tagline: "Coordination, speaker alignments, and resource scheduling",
      head: { name: "Samiksha Bansod", role: "Head Event Committee" },
      coHeads: [
        { name: "Aishwarya Ajbale", role: "Co-Head" },
        { name: "Sumedhbodhi Thoke", role: "Co-Head" }
      ],
      members: ["Nishant Asutkar", "Shrushti Awale", "Shrushti Wanere", "Bhargavi Kotte", "Minal Bhise"]
    },
    publicity: {
      title: "Publicity Committee",
      tagline: "Spreads offline awareness and conducts campaigns",
      head: { name: "Mayank Thool & Aarya Khetan", role: "Heads Publicity Committee" },
      coHeads: [
        { name: "Alfiya Pathan", role: "Co-Head" },
        { name: "Prince Meshram", role: "Co-Head" }
      ],
      members: ["Grisha Yadav", "Janvi Tandulkar", "Krushna Dewaikar", "Aryan Pote", "Dikshant Badole"]
    },
    creative: {
      title: "Creative Committee",
      tagline: "Designs department branding flyers and graphics",
      head: { name: "Latika Borkar", role: "Head Creative Committee" },
      coHeads: [
        { name: "Vedant Munde", role: "Co-Head" },
        { name: "Anushka Munne", role: "Co-Head" }
      ],
      members: ["Radha Zade", "Supriya Gotapode", "Ritu Meshram", "Poonam Wasade", "Nandini Korde"]
    },
    digital: {
      title: "Digital Committee",
      tagline: "Empowering Digital Transformation",
      head: { name: "Ziaan Ali", role: "Head Digital Committee" },
      coHeads: [
        { name: "Shrawani Nakhate", role: "Co-Head Digital Committee" }
      ],
      members: ["Khushab Bhiwgade", "Viraj Gojegave", "Arsalan Khan", "Sahil Rathod", "Anisha Bonde", "Aditya Thute"]
    },
    discipline: {
      title: "Discipline Committee",
      tagline: "Guarantees student protocol adherence during fests",
      head: { name: "Chetali Kumbhare & Rohan Thaokar", role: "Heads Discipline Committee" },
      coHeads: [
        { name: "Rahimeen Sheikh", role: "Co-Head (Girls)" },
        { name: "Soham Bainwad", role: "Co-Head (Boys)" }
      ],
      members: ["Sarthak Shende", "Ayush Gedam", "Rushikesh Bobde", "Omkar Khandale", "Prachi Shirname", "Dhanashri Pilare", "Nilakshi Shembhekar", "Pragati Nawalnate"]
    },
    hospitality: {
      title: "Hospitality Committee",
      tagline: "VIP reception and food court logistics management",
      head: { name: "Rijul Gajghate", role: "Head Hospitality Committee" },
      coHeads: [
        { name: "Sanjivini Girde", role: "Co-Head" },
        { name: "Riya Lanjekar", role: "Co-Head" }
      ],
      members: ["Ritu Patle", "Parineeta Charbhe"]
    },
    sports: {
      title: "Sports Committee",
      tagline: "Organizes college tournaments and guides squad lists",
      head: { name: "Sahil Pathak & Gaytri Banate", role: "Heads Sports Committee" },
      coHeads: [
        { name: "Parth Mothghare", role: "Co-Head" },
        { name: "Trupti Thool", role: "Co-Head" }
      ],
      members: ["Bhumika Nagpure", "Vishwajeet Gargre", "Himanshu Kuhite", "Paranav Nikole", "Mayur Meshram", "Maithali Mirchapure", "Priyanshu Kukde", "Jay Raikar", "Chaitali Thombre", "Nitu Pangul", "Shobit Khobragade", "Krish Thackre"]
    },
    cultural: {
      title: "Cultural Committee",
      tagline: "Coordinates music, dance, and stage performances",
      head: { name: "Damini Kawale", role: "Head Cultural Committee" },
      coHeads: [
        { name: "Mayank Daware", role: "Co-Head" }
      ],
      members: ["Tanushree Khadgi", "Darshan Satange", "Simran Biranwar", "Rahul Kosalkar"]
    },
    nontech: {
      title: "Non-Technical Committee",
      tagline: "Manages quizzes, debates, and dynamic campus games",
      head: { name: "Kunal Khande", role: "Head Non-Technical Committee" },
      coHeads: [
        { name: "Riaansh Nawale", role: "Co-Head" },
        { name: "Vijay Bharbat", role: "Co-Head" }
      ],
      members: ["No Members Assigned"]
    },
    socialmedia: {
      title: "Social Media Committee",
      tagline: "Reels creation and live Instagram coverage drives",
      head: { name: "Nirmal Raut", role: "Head Social Media Committee" },
      coHeads: [
        { name: "Atharva Rudrakar", role: "Co-Head" }
      ],
      members: ["No Members Assigned"]
    }
  };

  // Render Committee Profile details inside display panel
  window.selectActiveCommittee = function(committeeKey) {
    // 1. Highlight clicked card in the grid
    const cards = document.querySelectorAll('.committee-card');
    cards.forEach(card => {
      card.classList.remove('active-card');
      const onclickAttr = card.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(committeeKey)) {
        card.classList.add('active-card');
      }
    });

    // 2. Fetch data
    const com = committeesData[committeeKey];
    if (!com) return;

    // 3. Inject content structure
    const displayCard = document.getElementById('committee-display-card');
    
    // Format Head profile HTML
    const headHtml = `
      <div class="com-profile-card">
        <div class="com-profile-img-box">
          <span class="com-profile-placeholder">${com.head.name.split(' ')[0].substring(0,2).toUpperCase()}</span>
        </div>
        <div class="com-profile-name">${com.head.name}</div>
        <div class="com-profile-role">${com.head.role}</div>
      </div>
    `;

    // Format Co-Heads profiles HTML
    const coHeadsHtml = com.coHeads.map(co => `
      <div class="com-profile-card">
        <div class="com-profile-img-box">
          <span class="com-profile-placeholder">${co.name.split(' ')[0].substring(0,2).toUpperCase()}</span>
        </div>
        <div class="com-profile-name">${co.name}</div>
        <div class="com-profile-role">${co.role}</div>
      </div>
    `).join('');

    // Format Members text list HTML
    const membersHtml = com.members.map(m => `
      <div class="com-member-name-tag">${m}</div>
    `).join('');

    displayCard.innerHTML = `
      <div class="com-display-header">
        <h3 class="com-display-title">${com.title} Details</h3>
        <p class="com-display-tagline">“ ${com.tagline} ”</p>
      </div>

      <div class="com-member-heading">Committee Head</div>
      <div class="com-profiles-grid">
        ${headHtml}
      </div>

      <div class="com-member-heading">Committee Co-Head(s)</div>
      <div class="com-profiles-grid">
        ${coHeadsHtml}
      </div>

      <div class="com-members-names-container">
        <div class="com-member-heading" style="margin-bottom: 20px;">Members</div>
        <div class="com-members-grid">
          ${membersHtml}
        </div>
      </div>
    `;

    // 4. Smooth scroll to the display card container
    setTimeout(() => {
      displayCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };
});
