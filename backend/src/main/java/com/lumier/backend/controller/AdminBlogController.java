package com.lumier.backend.controller;

import com.lumier.backend.dto.admin.AdminBlogItemResponse;
import com.lumier.backend.dto.admin.AdminUpsertBlogRequest;
import com.lumier.backend.service.AdminBlogService;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/blogs")
public class AdminBlogController {

  private final AdminBlogService adminBlogService;

  public AdminBlogController(AdminBlogService adminBlogService) {
    this.adminBlogService = adminBlogService;
  }

  @GetMapping
  public List<AdminBlogItemResponse> blogs(@RequestParam String googleId) {
    return adminBlogService.getBlogs(googleId);
  }

  @PostMapping
  public AdminBlogItemResponse createBlog(
    @RequestParam String googleId,
    @RequestBody AdminUpsertBlogRequest request
  ) {
    return adminBlogService.createBlog(googleId, request);
  }

  @PutMapping("/{blogId}")
  public AdminBlogItemResponse updateBlog(
    @RequestParam String googleId,
    @PathVariable Long blogId,
    @RequestBody AdminUpsertBlogRequest request
  ) {
    return adminBlogService.updateBlog(googleId, blogId, request);
  }

  @DeleteMapping("/{blogId}")
  public void deleteBlog(@RequestParam String googleId, @PathVariable Long blogId) {
    adminBlogService.deleteBlog(googleId, blogId);
  }
}
