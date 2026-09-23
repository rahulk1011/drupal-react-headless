<?php

namespace Drupal\welcome\Controller;

class WelcomeController {
  /**
   * Returns a render array with comprehensive project information.
   */
  public function welcome() {
    $page_content = '<div>' .
      '<h2>Overview</h2>' .
      '<p>A monorepo that combines a Drupal 11 backend with a React 19 single-page application embedded in a custom Drupal theme. The project exposes custom REST resources for managing Content and Project Trackers, while Drupal remains the content, authentication, permissions, and API layer.</p>' .

      '<h2>Key Features</h2>' .
      '<ul>' .
      '<li>Drupal 11 backend managed through Composer</li>' .
      '<li>React 19 frontend located inside a custom Drupal theme</li>' .
      '<li>Single-repository architecture for backend and frontend code</li>' .
      '<li>Public read access for Project Tracker content</li>' .
      '<li>Authenticated create, update, and delete operations</li>' .
      '<li>Drupal session or HTTP Basic authentication support</li>' .
      '<li>CSRF protection for mutating requests</li>' .
      '</ul>' .

      '<h2>Architecture</h2>' .
      '<p>Drupal acts as the CMS and API provider. React consumes Drupal\'s REST API endpoints and renders the user interface. Production frontend assets can be built and served through the custom Drupal theme, while the Vite development server can be used during frontend development.</p>' .

      '<h2>Technical Highlights</h2>' .
      '<ul>' .
      '<li><strong>Headless Drupal Architecture:</strong> Decoupled Drupal and React architecture powered by RESTful integrations</li>' .
      '<li><strong>Custom REST API Development:</strong> Custom Drupal APIs for content and project tracker management</li>' .
      '<li><strong>Secure API Implementation:</strong> Authenticated API access with CSRF protection and security controls</li>' .
      '<li><strong>Custom CORS Management:</strong> Dedicated cross-origin request handling for secure frontend-backend communication</li>' .
      '<li><strong>Modern React Application Structure:</strong> Modular frontend design leveraging APIs, Hooks, Components, and Pages</li>' .
      '<li><strong>Mono-Repo Development Strategy:</strong> Drupal backend and React frontend are maintained within a single repository</li>' .
      '<li><strong>API-First Design Pattern:</strong> Business functionality exposed through reusable and scalable APIs</li>' .
      '<li><strong>Multilingual Support:</strong> Language-aware APIs and React internationalization</li>' .
      '</ul>' .

      '<h2>Functional Highlights</h2>' .
      '<ul>' .
      '<li><strong>Client Information System:</strong> Centralized management of client and project-related information</li>' .
      '<li><strong>Project Tracker Management System:</strong> A structured tracking and management of project activities and deliverables</li>' .
      '<li><strong>Project Task Status Tracking:</strong> Support for multiple task statuses throughout the project lifecycle</li>' .
      '<li><strong>Testimonials & Trending Topics Information:</strong> Administrative capability to manage client testimonials and trending content</li>' .
      '<li><strong>Full CRUD Operations:</strong> Users can Create, Read, Update, and Delete records using API-driven workflows</li>' .
      '<li><strong>Role-Based Access Control:</strong> Permission-based access for authenticated and anonymous users</li>' .
      '<li><strong>Public and Authenticated User Experience:</strong> The platform offers different experiences based on user authentication status</li>' .
      '<li><strong>Localized Experience:</strong> Translated content, localized UI and language switching</li>' .
      '</ul>' .
      '</div>';

    return [
      '#markup' => $page_content,
    ];
  }
}
