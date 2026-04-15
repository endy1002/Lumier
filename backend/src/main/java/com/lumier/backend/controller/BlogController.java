package com.lumier.backend.controller;

import com.lumier.backend.dto.blog.BlogCardResponse;
import com.lumier.backend.dto.blog.BlogDetailResponse;
import com.lumier.backend.service.BlogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

  private final BlogService blogService;

  public BlogController(BlogService blogService) {
    this.blogService = blogService;
  }

  @GetMapping
  public List<BlogCardResponse> listPublished() {
    return blogService.getPublishedCards();
  }

  @GetMapping("/{slug}")
  public BlogDetailResponse detail(@PathVariable String slug) {
    return blogService.getPublishedDetailBySlug(slug);
  }
}
