<?php

namespace Drupal\apiservices\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\Request;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 * @RestResource(
 *   id = "topiclist_rest",
 *   label = @Translation("Topiclist API"),
 *   uri_paths = {
 *     "canonical" = "/api/topiclist",
 *     "create" = "/api/add-topic"
 *   }
 * )
 */

class TopicList extends ResourceBase
{
	/**
	 * A current user instance which is logged in the session.
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $loggedUser;

	/**
	 * Constructs a Drupal\rest\Plugin\ResourceBase object.
	 */
	public function __construct(array $config, $module_id, $module_definition, array $serializer_formats, LoggerInterface $logger, AccountProxyInterface $current_user)
	{
		parent::__construct($config, $module_id, $module_definition, $serializer_formats, $logger);
		$this->loggedUser = $current_user;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $config, $module_id, $module_definition)
	{
		return new static(
			$config,
			$module_id,
			$module_definition,
			$container->getParameter('serializer.formats'),
			$container->get('logger.factory')->get('topiclist_api'),
			$container->get('current_user')
		);
	}

	/*
   * Get All Topiclist API
   */
	public function get(Request $request)
	{
		try {
			$langcode = $request?->query->get('langcode', \Drupal::languageManager()
				->getCurrentLanguage()
				->getId());

			$project_nids = \Drupal::entityQuery('node')
				->accessCheck(TRUE)
				->condition('type', 'topic_list')
				->condition('status', 1)
				->execute();

			$project_nodes = Node::loadMultiple($project_nids);

			$project_list_data = [];

			foreach ($project_nodes as $node) {
				if ($node->hasTranslation($langcode)) {
					$node = $node->getTranslation($langcode);
				}

				$topic_fid = $node->get('field_content_image')->target_id;
				$topic_image = $topic_fid ? File::load($topic_fid) : NULL;
				$image_url = $topic_image ? \Drupal::service('file_url_generator')->generateAbsoluteString($topic_image->getFileUri()) : '';

				$project_list_data[] = [
					'id' => $node->id(),
					'title' => $node->getTitle(),
					'subheading' => $node->get('field_sub_heading')->value ?? '',
					'description' => $node->get('field_description')->value ?? '',
					'trending' => $node->get('field_trending')->value ?? '',
					'topic_img' => $image_url,
				];
			}

			return new JsonResponse([
				'status' => 'Success',
				'message' => 'Topic List',
				'language' => $langcode,
				'result' => $project_list_data,
			]);
		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
	}

	/**
	 * Creates a new topic_list "topic" node with required image file upload. Admin-only.
	 * Route: POST /api/add-topic
	 */
	public function post(Request $request)
	{
		if ($this->loggedUser->isAnonymous() || !in_array('administrator', $this->loggedUser->getRoles(), TRUE)) {
			return new JsonResponse([
				'status' => 'Error',
				'message' => 'Administrator access required to create topics.',
			], 403);
		}

		try {
			$data = json_decode($request->getContent(), TRUE) ?: [];
			$title = trim($data['title'] ?? '');
			$subheading = trim($data['subheading'] ?? '');
			$description = trim($data['description'] ?? '');
			$trending = trim($data['trending'] ?? '');
			$langcode = trim($data['langcode'] ?? $data['language'] ?? '');
			$base64_image = $data['image'] ?? '';
			$image_name = trim($data['image_name'] ?? 'topic.jpg');

			// Validate mandatory fields
			if (
				empty($title) || empty($subheading) || empty($description) || empty($trending) || empty($langcode) || empty($base64_image) ) {
				return new JsonResponse([
					'status' => 'Error',
					'message' => 'Missing required fields: Title, Subheading, Description, Trending, Language, and Image are mandatory.',
				], 400);
			}
			$trending_val = strtolower($trending) === 'yes' ? 'yes' : 'no';

			// Decode and process Base64 image
			$file_id = NULL;
			if (preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
				$image_data = substr($base64_image, strpos($base64_image, ',') + 1);
				$decoded_data = base64_decode($image_data);

				if ($decoded_data !== FALSE) {
					$directory = 'public://topic-images';
					\Drupal::service('file_system')->prepareDirectory(
						$directory,
						FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS
					);
					$file_uri = \Drupal::service('file_system')->saveData(
						$decoded_data,
						$directory . '/' . $image_name,
						FileSystemInterface::EXISTS_RENAME
					);
					if ($file_uri) {
						$file = File::create([
							'uri' => $file_uri,
							'uid' => $this->loggedUser->id(),
							'status' => 1,
						]);
						$file->save();
						$file_id = $file->id();
					}
				}
			}

			if (!$file_id) {
				return new JsonResponse([
					'status' => 'Error',
					'message' => 'Failed to process and save uploaded image.',
				], 400);
			}

			// Build node data payload
			$node_data = [
				'type' => 'topic_list',
				'langcode' => $langcode,
				'title' => $title,
				'field_sub_heading' => $subheading,
				'field_description' => $description,
				'field_trending' => $trending_val,
				'status' => 1,
				'field_content_image' => [
					'target_id' => $file_id,
					'alt' => $title,
				],
			];

			$node = Node::create($node_data);
			$node->save();

			// Resolve image URL for response
			$file_entity = File::load($file_id);
			$image_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file_entity->getFileUri());

			return new JsonResponse([
				'status' => 'Success',
				'message' => 'Topic created successfully.',
				'result' => [
					'id' => $node->id(),
					'title' => $node->getTitle(),
					'subheading' => $subheading,
					'description' => $description,
					'trending' => $trending_val,
					'topic_img' => $image_url,
				],
			], 201);
		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
	}

	/**
	 * Returns a JSON error response for an exception.
	 */
	private function exception_error_msg($message)
	{
		$this->logger->error($message);
		return new JsonResponse([
			'status' => 'Error',
			'message' => 'An unexpected error occurred.',
			'error' => $message,
		], 500);
	}
}
