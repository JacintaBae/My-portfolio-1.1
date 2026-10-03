/* Emecheta Jacinta portfolio: vanilla JS, shared by all pages. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Mobile menu (active link is set in the HTML via aria-current)
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Scroll reveal
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  } else { items.forEach(function (i) { i.classList.add('in'); }); }

  // Back to top
  var top = $('.totop');
  window.addEventListener('scroll', function () { top.hidden = window.scrollY < 500; }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Typing effect (static text if reduced motion)
  var t = $('#typed');
  if (t && !reduce) {
    var words = t.dataset.words.split('|'), wi = 0, ci = words[0].length, del = true;
    (function tick() {
      var w = words[wi];
      ci += del ? -1 : 1; t.textContent = w.slice(0, ci);
      var d = 90;
      if (!del && ci === w.length) { del = true; d = 1600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      setTimeout(tick, d);
    })();
  }

  // Project modal
  var DATA = {
    static: { t: 'Secure Static Website Deployment on AWS',
      o: 'A lab project hosting a static website on an EC2 instance in a custom VPC, reachable over HTTPS and with network activity logged.',
      a: 'Custom VPC with an Internet Gateway and a public subnet. A Linux EC2 instance runs Nginx. Security groups allow only needed ports, while a NACL adds a subnet-level layer. DNS points the domain to the server, Let\'s Encrypt provides the certificate, and VPC Flow Logs record traffic.',
      c: 'Understanding why traffic was blocked when security groups and NACLs disagreed, and getting certificate issuance working with DNS.',
      l: 'How stateful and stateless filters differ, how routing makes a subnet public, and why logging matters for security.' },
    ha: { t: 'High Availability AWS Web Infrastructure',
      o: 'A lab design for a web application that keeps running if an instance fails and keeps private resources off the public internet.',
      a: 'Public and private subnets across zones. An Application Load Balancer spreads traffic to EC2 instances managed by Auto Scaling. EFS provides shared storage. A bastion host gives controlled admin access, a NAT Gateway lets private instances reach out, Route 53 and ACM handle DNS and TLS, and Datadog provides monitoring.',
      c: 'Keeping security group rules tight between tiers while still allowing health checks and administration.',
      l: 'How each component contributes to availability, isolation or visibility, and how the pieces depend on each other.' },
    movie: { t: 'Containerized Movie Application',
      o: 'A learning project that packages a movie application with Docker and runs it on AWS.',
      a: 'Frontend and backend images are built with Docker and stored in Amazon ECR. The containers run on an EC2 instance. The backend connects to MongoDB Atlas, an external managed database service. It is not a Docker container. Source code is kept on GitHub.',
      c: 'Configuring the database connection and allowing the EC2 instance to reach Atlas securely.',
      l: 'The difference between running a service yourself and consuming a managed one, and how a registry fits into delivery.' },
    compose: { t: 'Docker Compose Deployment',
      o: 'A learning implementation of a frontend and backend application defined together with Docker Compose. Not a professional deployment.',
      a: 'One container for the frontend and one for the backend, defined in a Compose file on a shared network so they reach each other by service name. Images can be pushed to ECR and the stack run on EC2.',
      c: 'Getting service names, ports and environment variables to line up between containers.',
      l: 'How container networking works and why Compose makes multi-container setups repeatable.' } };
  var modal = $('#modal');
  if (modal) {
    var box = $('.modal-box', modal), last;
    var sec = function (h, p) { return '<h3>' + h + '</h3><p>' + p + '</p>'; };
    var close = function () { modal.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
    $$('[data-project]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = DATA[b.dataset.project]; last = b;
        $('#m-title').textContent = d.t;
        $('#m-body').innerHTML = sec('Project overview', d.o) + sec('Architecture', d.a) + sec('Challenges', d.c) + sec('What I learned', d.l);
        modal.hidden = false; document.body.style.overflow = 'hidden'; box.focus();
      });
    });
    $('.close', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = $$('button,a[href]', box); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  // Contact form validation (demo only: nothing is sent)
  var form = $('#contact-form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length < 2 ? 'Enter your name.' : ''; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'; },
      subject: function (v) { return v.trim().length < 3 ? 'Enter a subject.' : ''; },
      message: function (v) { return v.trim().length < 10 ? 'Write at least 10 characters.' : ''; } };
    var check = function (k) {
      var el = form.elements[k], msg = rules[k](el.value);
      $('#' + k + '-err').textContent = msg; el.setAttribute('aria-invalid', !!msg); return !msg;
    };
    Object.keys(rules).forEach(function (k) { form.elements[k].addEventListener('blur', function () { check(k); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);
      $('#form-ok').hidden = !ok;
      if (ok) form.reset(); else form.querySelector('[aria-invalid=true]').focus();
    });
  }
})();