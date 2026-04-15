package com.lumier.backend.service;

import com.lumier.backend.domain.Audiobook;
import com.lumier.backend.domain.BookAuthor;
import com.lumier.backend.domain.Product;
import com.lumier.backend.domain.enums.ProductCategory;
import com.lumier.backend.dto.admin.AdminAudiobookItemResponse;
import com.lumier.backend.dto.admin.AdminAuthorOptionResponse;
import com.lumier.backend.dto.admin.AdminExploreDashboardResponse;
import com.lumier.backend.dto.admin.AdminProductOptionResponse;
import com.lumier.backend.dto.admin.AdminUpsertAuthorRequest;
import com.lumier.backend.dto.admin.AdminUpsertProductRequest;
import com.lumier.backend.dto.admin.AdminUpdateAudiobookRequest;
import com.lumier.backend.repository.AudiobookRepository;
import com.lumier.backend.repository.BookAuthorRepository;
import com.lumier.backend.repository.OrderItemRepository;
import com.lumier.backend.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminExploreService {

  private final AdminAuthorizationService adminAuthorizationService;
  private final ProductRepository productRepository;
  private final BookAuthorRepository bookAuthorRepository;
  private final AudiobookRepository audiobookRepository;
  private final OrderItemRepository orderItemRepository;

  public AdminExploreService(
    AdminAuthorizationService adminAuthorizationService,
    ProductRepository productRepository,
    BookAuthorRepository bookAuthorRepository,
    AudiobookRepository audiobookRepository,
    OrderItemRepository orderItemRepository
  ) {
    this.adminAuthorizationService = adminAuthorizationService;
    this.productRepository = productRepository;
    this.bookAuthorRepository = bookAuthorRepository;
    this.audiobookRepository = audiobookRepository;
    this.orderItemRepository = orderItemRepository;
  }

  @Transactional(readOnly = true)
  public AdminExploreDashboardResponse getDashboard(String googleId) {
    adminAuthorizationService.requireAdmin(googleId);

    List<AdminProductOptionResponse> products = productRepository.findAllByOrderByIdAsc()
      .stream()
      .map(this::toProduct)
      .toList();

    List<AdminAuthorOptionResponse> authors = bookAuthorRepository.findAllByOrderByDisplayOrderAscIdAsc()
      .stream()
      .map(this::toAuthor)
      .toList();

    List<AdminAudiobookItemResponse> audiobooks = audiobookRepository.findCharmAudiobooksOrderByDisplayOrderAsc()
      .stream()
      .map(this::toItem)
      .toList();

    return new AdminExploreDashboardResponse(products, authors, audiobooks);
  }

  @Transactional
  public AdminProductOptionResponse createProduct(String googleId, AdminUpsertProductRequest request) {
    adminAuthorizationService.requireAdmin(googleId);

    ProductCategory category = Objects.requireNonNull(request.category(), "Category là bắt buộc.");
    Product product = new Product();
    product.setName(requireNonBlank(request.name(), "Tên sản phẩm là bắt buộc."));
    product.setCategory(category);
    product.setBasePrice(requirePositivePrice(request.basePrice(), "Giá sản phẩm phải lớn hơn 0."));
    product.setImageUrl(trimToNull(request.imageUrl()));
    product.setAvailable(request.isAvailable() == null || request.isAvailable());

    Product saved = productRepository.save(product);

    if (category == ProductCategory.CHARM) {
      createRequiredCharmAudiobook(saved, request);
    }

    return toProduct(saved);
  }

  @Transactional
  public AdminProductOptionResponse updateProduct(String googleId, Long productId, AdminUpsertProductRequest request) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredProductId = Objects.requireNonNull(productId);

    Product product = productRepository.findById(requiredProductId)
      .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại: " + productId));

    Audiobook linkedAudiobook = audiobookRepository.findByProductId(productId).orElse(null);

    if (request.name() != null) {
      product.setName(requireNonBlank(request.name(), "Tên sản phẩm không được để trống."));
    }
    if (request.basePrice() != null) {
      product.setBasePrice(requirePositivePrice(request.basePrice(), "Giá sản phẩm phải lớn hơn 0."));
    }
    if (request.imageUrl() != null) {
      product.setImageUrl(trimToNull(request.imageUrl()));
    }
    if (request.isAvailable() != null) {
      product.setAvailable(request.isAvailable());
    }

    if (request.category() != null) {
      if (request.category() != ProductCategory.CHARM && linkedAudiobook != null) {
        throw new IllegalArgumentException("Không thể chuyển category khỏi CHARM khi sản phẩm đã có audiobook.");
      }
      product.setCategory(request.category());
    }

    Product saved = productRepository.save(Objects.requireNonNull(product));

    if (linkedAudiobook != null) {
      linkedAudiobook.setCoverImageUrl(trimToNull(saved.getImageUrl()));
      audiobookRepository.save(linkedAudiobook);
    }

    if (saved.getCategory() == ProductCategory.CHARM && linkedAudiobook == null && hasAudiobookSeed(request)) {
      createRequiredCharmAudiobook(saved, request);
    }

    return toProduct(saved);
  }

  @Transactional
  public void deleteProduct(String googleId, Long productId) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredProductId = Objects.requireNonNull(productId);

    Product product = productRepository.findById(requiredProductId)
      .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại: " + productId));

    if (orderItemRepository.existsByProduct_Id(requiredProductId)) {
      product.setAvailable(false);
      productRepository.save(product);

      audiobookRepository.findByProductId(requiredProductId).ifPresent(audiobook -> {
        audiobook.setProductId(null);
        audiobook.setActive(false);
        audiobookRepository.save(audiobook);
      });
      return;
    }

    audiobookRepository.findByProductId(productId).ifPresent(audiobook -> {
      audiobook.setProductId(null);
      audiobook.setActive(false);
      audiobookRepository.save(audiobook);
    });

    try {
      productRepository.delete(Objects.requireNonNull(product));
    } catch (DataIntegrityViolationException ex) {
      product.setAvailable(false);
      productRepository.save(product);
    }
  }

  @Transactional
  public AdminAuthorOptionResponse createAuthor(String googleId, AdminUpsertAuthorRequest request) {
    adminAuthorizationService.requireAdmin(googleId);

    BookAuthor author = new BookAuthor();
    author.setName(requireNonBlank(request.name(), "Tên tác giả là bắt buộc."));
    author.setBio(trimToNull(request.bio()));
    author.setAvatarUrl(trimToNull(request.avatarUrl()));
    author.setFeaturedWorks(trimToNull(request.featuredWorks()));
    author.setInfoImage1(trimToNull(request.infoImage1()));
    author.setInfoImage2(trimToNull(request.infoImage2()));
    author.setInfoImage3(trimToNull(request.infoImage3()));
    author.setDisplayOrder(request.displayOrder() == null ? bookAuthorRepository.findMaxDisplayOrder() + 1 : request.displayOrder());
    author.setActive(request.isActive() == null || request.isActive());

    return toAuthor(bookAuthorRepository.save(author));
  }

  @Transactional
  public AdminAuthorOptionResponse updateAuthor(String googleId, Long authorId, AdminUpsertAuthorRequest request) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredAuthorId = Objects.requireNonNull(authorId);

    BookAuthor author = bookAuthorRepository.findById(requiredAuthorId)
      .orElseThrow(() -> new EntityNotFoundException("Tác giả không tồn tại: " + authorId));

    if (request.name() != null) {
      author.setName(requireNonBlank(request.name(), "Tên tác giả không được để trống."));
    }
    if (request.bio() != null) {
      author.setBio(trimToNull(request.bio()));
    }
    if (request.avatarUrl() != null) {
      author.setAvatarUrl(trimToNull(request.avatarUrl()));
    }
    if (request.featuredWorks() != null) {
      author.setFeaturedWorks(trimToNull(request.featuredWorks()));
    }
    if (request.infoImage1() != null) {
      author.setInfoImage1(trimToNull(request.infoImage1()));
    }
    if (request.infoImage2() != null) {
      author.setInfoImage2(trimToNull(request.infoImage2()));
    }
    if (request.infoImage3() != null) {
      author.setInfoImage3(trimToNull(request.infoImage3()));
    }
    if (request.displayOrder() != null) {
      author.setDisplayOrder(request.displayOrder());
    }
    if (request.isActive() != null) {
      author.setActive(request.isActive());
    }

    return toAuthor(bookAuthorRepository.save(Objects.requireNonNull(author)));
  }

  @Transactional
  public void deleteAuthor(String googleId, Long authorId) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredAuthorId = Objects.requireNonNull(authorId);

    BookAuthor author = bookAuthorRepository.findById(requiredAuthorId)
      .orElseThrow(() -> new EntityNotFoundException("Tác giả không tồn tại: " + authorId));

    if (audiobookRepository.existsByAuthor_Id(authorId)) {
      throw new IllegalArgumentException("Không thể xóa tác giả đang được liên kết với audiobook.");
    }

    bookAuthorRepository.delete(Objects.requireNonNull(author));
  }

  @Transactional
  public AdminAudiobookItemResponse updateAudiobook(String googleId, Long audiobookId, AdminUpdateAudiobookRequest request) {
    adminAuthorizationService.requireAdmin(googleId);

    if (audiobookId == null) {
      throw new IllegalArgumentException("Thiếu audiobookId.");
    }

    Audiobook audiobook = audiobookRepository.findById(Objects.requireNonNull(audiobookId))
      .orElseThrow(() -> new EntityNotFoundException("Audiobook không tồn tại: " + audiobookId));

    Product selectedProduct = resolveProduct(audiobook.getProductId(), request.productId());
    if (selectedProduct == null || selectedProduct.getCategory() != ProductCategory.CHARM) {
      throw new IllegalArgumentException("Audiobook chỉ được gán cho sản phẩm thuộc category CHARM.");
    }

    if (request.productName() != null) {
      String productName = request.productName().trim();
      if (productName.isBlank()) {
        throw new IllegalArgumentException("Tên sản phẩm không được để trống.");
      }
      selectedProduct.setName(productName);
      productRepository.save(selectedProduct);
    }

    BookAuthor author = resolveAuthor(audiobook.getAuthor(), request.authorId(), request.authorName());

    if (request.title() != null) {
      String value = request.title().trim();
      if (value.isBlank()) {
        throw new IllegalArgumentException("Tên audiobook không được để trống.");
      }
      audiobook.setTitle(value);
    }

    if (request.narrator() != null) {
      audiobook.setNarrator(trimToNull(request.narrator()));
    }
    if (request.durationMinutes() != null) {
      if (request.durationMinutes() <= 0) {
        throw new IllegalArgumentException("Duration phải lớn hơn 0.");
      }
      audiobook.setDurationMinutes(request.durationMinutes());
    }
    if (request.summary() != null) {
      audiobook.setSummary(trimToNull(request.summary()));
    }
    if (request.audioFileUrl() != null) {
      audiobook.setAudioFileUrl(trimToNull(request.audioFileUrl()));
    }
    if (request.audioFormat() != null) {
      audiobook.setAudioFormat(trimToNull(request.audioFormat()));
    }
    if (request.displayOrder() != null) {
      audiobook.setDisplayOrder(request.displayOrder());
    }
    if (request.isActive() != null) {
      audiobook.setActive(request.isActive());
    }

    audiobook.setProductId(selectedProduct.getId());
    audiobook.setAuthor(author);
  audiobook.setCoverImageUrl(trimToNull(selectedProduct.getImageUrl()));

    return toItem(audiobookRepository.save(audiobook));
  }

  private Product resolveProduct(Long currentProductId, Long requestedProductId) {
    Long targetId = requestedProductId != null ? requestedProductId : currentProductId;
    if (targetId == null) {
      return null;
    }

    return productRepository.findById(targetId)
      .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại: " + targetId));
  }

  private void createRequiredCharmAudiobook(Product product, AdminUpsertProductRequest request) {
    if (audiobookRepository.findByProductId(product.getId()).isPresent()) {
      return;
    }

    BookAuthor author = resolveAuthorForCreate(
      request.audiobookAuthorId(),
      request.audiobookAuthorName()
    );

    Audiobook audiobook = new Audiobook();
    audiobook.setProductId(product.getId());
    audiobook.setAuthor(author);
    audiobook.setTitle(requireNonBlank(request.audiobookTitle(), "Sản phẩm CHARM bắt buộc có tiêu đề audiobook."));
    audiobook.setNarrator(requireNonBlank(request.audiobookNarrator(), "Sản phẩm CHARM bắt buộc có thông tin người đọc audiobook."));

    Integer duration = request.audiobookDurationMinutes();
    if (duration == null || duration <= 0) {
      throw new IllegalArgumentException("Sản phẩm CHARM bắt buộc có thời lượng audiobook hợp lệ.");
    }
    audiobook.setDurationMinutes(duration);

    audiobook.setSummary(requireNonBlank(request.audiobookSummary(), "Sản phẩm CHARM bắt buộc có tóm tắt audiobook."));
    audiobook.setAudioFileUrl(requireNonBlank(request.audiobookAudioFileUrl(), "Sản phẩm CHARM bắt buộc có URL audio."));
    audiobook.setAudioFormat(requireNonBlank(request.audiobookAudioFormat(), "Sản phẩm CHARM bắt buộc có định dạng audio."));

    audiobook.setCoverImageUrl(trimToNull(product.getImageUrl()));

    audiobook.setDisplayOrder(request.audiobookDisplayOrder() == null
      ? audiobookRepository.findMaxDisplayOrder() + 1
      : request.audiobookDisplayOrder());
    audiobook.setActive(request.audiobookIsActive() == null || request.audiobookIsActive());

    audiobookRepository.save(audiobook);
  }

  private boolean hasAudiobookSeed(AdminUpsertProductRequest request) {
    return trimToNull(request.audiobookTitle()) != null
      || trimToNull(request.audiobookAudioFileUrl()) != null
      || trimToNull(request.audiobookAuthorName()) != null
      || request.audiobookAuthorId() != null;
  }

  private BookAuthor resolveAuthorForCreate(Long authorId, String authorName) {
    if (authorId != null) {
      return bookAuthorRepository.findById(authorId)
        .orElseThrow(() -> new EntityNotFoundException("Tác giả không tồn tại: " + authorId));
    }

    String normalized = requireNonBlank(authorName, "Sản phẩm CHARM bắt buộc có tác giả audiobook.");
    return bookAuthorRepository.findByNameIgnoreCase(normalized)
      .orElseGet(() -> {
        BookAuthor author = new BookAuthor();
        author.setName(normalized);
        author.setDisplayOrder(bookAuthorRepository.findMaxDisplayOrder() + 1);
        author.setActive(true);
        return bookAuthorRepository.save(author);
      });
  }

  private BookAuthor resolveAuthor(BookAuthor currentAuthor, Long requestedAuthorId, String requestedAuthorName) {
    if (requestedAuthorId != null) {
      return bookAuthorRepository.findById(requestedAuthorId)
        .orElseThrow(() -> new EntityNotFoundException("Tác giả không tồn tại: " + requestedAuthorId));
    }

    if (requestedAuthorName == null) {
      return currentAuthor;
    }

    String normalized = requestedAuthorName.trim();
    if (normalized.isBlank()) {
      throw new IllegalArgumentException("Tên tác giả không được để trống.");
    }

    return bookAuthorRepository.findByNameIgnoreCase(normalized)
      .orElseGet(() -> {
        BookAuthor author = new BookAuthor();
        author.setName(normalized);
        author.setActive(true);
        author.setDisplayOrder(bookAuthorRepository.findMaxDisplayOrder() + 1);
        return bookAuthorRepository.save(author);
      });
  }

  private AdminAudiobookItemResponse toItem(Audiobook audiobook) {
    Product product = audiobook.getProductId() == null
      ? null
      : productRepository.findById(Objects.requireNonNull(audiobook.getProductId())).orElse(null);

    return new AdminAudiobookItemResponse(
      audiobook.getId(),
      audiobook.getProductId(),
      product == null ? null : product.getName(),
      audiobook.getAuthor().getId(),
      audiobook.getAuthor().getName(),
      audiobook.getTitle(),
      audiobook.getNarrator(),
      audiobook.getDurationMinutes(),
      product == null ? audiobook.getCoverImageUrl() : product.getImageUrl(),
      audiobook.getSummary(),
      audiobook.getAudioFileUrl(),
      audiobook.getAudioFormat(),
      audiobook.getDisplayOrder(),
      audiobook.isActive()
    );
  }

  private AdminProductOptionResponse toProduct(Product product) {
    boolean hasAudiobook = product.getCategory() == ProductCategory.CHARM
      && audiobookRepository.findByProductId(product.getId()).isPresent();

    return new AdminProductOptionResponse(
      product.getId(),
      product.getName(),
      product.getCategory(),
      product.getBasePrice(),
      product.getImageUrl(),
      product.isAvailable(),
      hasAudiobook
    );
  }

  private AdminAuthorOptionResponse toAuthor(BookAuthor author) {
    return new AdminAuthorOptionResponse(
      author.getId(),
      author.getName(),
      author.getBio(),
      author.getAvatarUrl(),
      author.getFeaturedWorks(),
      author.getInfoImage1(),
      author.getInfoImage2(),
      author.getInfoImage3(),
      author.getDisplayOrder(),
      author.isActive()
    );
  }

  private String requireNonBlank(String value, String message) {
    String normalized = trimToNull(value);
    if (normalized == null) {
      throw new IllegalArgumentException(message);
    }
    return normalized;
  }

  private BigDecimal requirePositivePrice(BigDecimal value, String message) {
    if (value == null || value.signum() <= 0) {
      throw new IllegalArgumentException(message);
    }
    return value;
  }

  private String trimToNull(String value) {
    String normalized = value == null ? null : value.trim();
    return (normalized == null || normalized.isBlank()) ? null : normalized;
  }
}
