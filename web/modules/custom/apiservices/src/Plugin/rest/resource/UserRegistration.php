<?php

namespace Drupal\apiservices\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides a REST resource for custom user registration.
 *
 * @RestResource(
 *   id = "user_registration_rest",
 *   label = @Translation("User Registration API"),
 *   uri_paths = {
 *     "create" = "/api/user-registration"
 *   }
 * )
 */
class UserRegistration extends ResourceBase
{

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The current user session.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new UserRegistration object.
   */
  public function __construct(
    array $config,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    EntityTypeManagerInterface $entity_type_manager,
    AccountProxyInterface $current_user
  ) {
    parent::__construct($config, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->entityTypeManager = $entity_type_manager;
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $config, $plugin_id, $plugin_definition)
  {
    return new static(
      $config,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('user_registration_api'),
      $container->get('entity_type.manager'),
      $container->get('current_user')
    );
  }

  /**
   * Handles user registration POST requests.
   * Route: POST /api/user-registration?_format=json
   */
  public function post(Request $request)
  {
    try {
			// Security validation codes
			$codes = [
				'administrator' => '1011',
				'manager' => '1401',
				'client' => '6498',
				'engineer' => '4965',
			];

      $params = json_decode($request->getContent(), TRUE) ?? [];

      // 1. Mandatory Field Validation
      $missingFields = [];
      foreach (['usertype', 'security_code', 'firstname', 'lastname', 'email', 'password'] as $field) {
        if (empty($params[$field])) {
          $missingFields[] = ucfirst($field);
        }
      }

      if (!empty($missingFields)) {
        return new JsonResponse([
          'status' => 'Error',
          'message' => 'Mandatory Fields Missing',
          'result' => 'Required fields: ' . implode(', ', $missingFields),
        ], 400);
      }

      // Format inputs
      $firstName = trim(preg_replace('/[^A-Za-z0-9 ]/', '', $params['firstname']));
      $lastName = trim(preg_replace('/[^A-Za-z0-9 ]/', '', $params['lastname']));
      $userEmail = trim($params['email']);
      $userPassword = $params['password'];
			$usertype = trim($params['usertype']);
			$security_code = trim($params['security_code']);

      $userName = strtolower($firstName . '.' . $lastName) . '.' . date('dmy');
      $userFullName = ucfirst($firstName) . ' ' . ucfirst($lastName);

      // 2. Email Format Check
      if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        $this->logger->warning('User provided invalid email address: @email', ['@email' => $userEmail]);
        return new JsonResponse([
          'status' => 'Error',
          'message' => 'Registration Failed',
          'result' => 'Please provide a valid Email-ID.',
        ], 422);
      }

      // 3. Password Criteria Check (Min 8 characters, at least 1 uppercase, 1 lowercase, 1 number)
      $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/';
      if (!preg_match($passwordPattern, $userPassword)) {
        $this->logger->warning('User password does not meet security criteria.');
        return new JsonResponse([
          'status' => 'Error',
          'message' => 'Registration Failed',
          'result' => 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
        ], 422);
      }

      // 4. Duplicate Check (Email or Username)
      $userStorage = $this->entityTypeManager->getStorage('user');

      $existingEmail = $userStorage->getQuery()
        ->accessCheck(FALSE)
        ->condition('mail', $userEmail)
        ->execute();

      $existingUsername = $userStorage->getQuery()
        ->accessCheck(FALSE)
        ->condition('name', $userName)
        ->execute();

      if (!empty($existingEmail) || !empty($existingUsername)) {
        $this->logger->warning('User registration attempt with existing details: @email or @name', [
          '@email' => $userEmail,
          '@name' => $userName,
        ]);
        return new JsonResponse([
          'status' => 'Error',
          'message' => 'Registration Failed',
          'result' => 'An account with these details already exists.',
        ], 409);
      }

			// 5. Check user-type code
			if (!isset($codes[$usertype]) || $codes[$usertype] !== $security_code) {
				return new JsonResponse([
					'status' => 'Error',
					'result' => 'Invalid security code.',
				], 400);
			}

      // 6. Create and Save User Entity
      /** @var \Drupal\user\UserInterface $user */
      $user = $userStorage->create([
        'name' => $userName,
        'pass' => $userPassword,
        'mail' => $userEmail,
        'roles' => [$usertype], // 'authenticated' is added automatically by Drupal
        'field_firstname' => ucfirst($firstName),
        'field_lastname' => ucfirst($lastName),
        'status' => 1,
      ]);
      $user->save();

      $this->logger->info('User registration successful for @name (@email).', [
        '@name' => $userFullName,
        '@email' => $userEmail,
      ]);

      return new JsonResponse([
        'status' => 'Success',
        'message' => 'Registration Successful',
        'result' => "Thank you. An account for {$userFullName} has been created.",
      ], 201);
    } catch (\Exception $exception) {
      $this->logger->error($exception->getMessage());
      return new JsonResponse([
        'status' => 'Error',
        'message' => 'An unexpected error occurred.',
        'error' => $exception->getMessage(),
      ], 500);
    }
  }
}
