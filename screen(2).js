super().__init__((SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2), ship_surface, 15)
    
    self.max_speed = 7
    self.rotation_speed = 4
    self.acceleration = 0.2
    self.friction = 0.99 # Slows down drift gradually

def rotate(self, direction):
    """Rotates the ship (direction = -1 for left, 1 for right)"""
    self.angle += direction * self.rotation_speed
    self.angle %= 360
    self.image = pygame.transform.rotate(self.image_original, -self.angle)
    self.rect = self.image.get_rect(center=self.rect.center)

def thrust(self):
    """Accelerates the ship in the direction it's facing (Newtonian physics)"""
    # Convert angle to a vector (Pygame angles start at the positive x-axis)
    rad = math.radians(self.angle - 90) # Adjust for forward facing (up)
    thrust_vector = pygame.math.Vector2(math.cos(rad), math.sin(rad))
    
    self.velocity += thrust_vector * self.acceleration
    
    # Limit the speed
    if self.velocity.length() > self.max_speed:
        self.velocity.scale_to_length(self.max_speed)

def update(self):
    # Apply friction/inertia
    self.velocity *= self.friction
    super().update()
    
def shoot(self, all_sprites, bullets):
    """Creates a new bullet in front of the ship"""
    
    # Calculate bullet starting position and direction
    rad = math.radians(self.angle - 90)
    direction_vector = pygame.math.Vector2(math.cos(rad), math.sin(rad))
    
    # Spawn the bullet slightly in front of the ship's center
    bullet_pos = self.pos + direction_vector * self.radius
    
    bullet = Bullet(bullet_pos, direction_vector * 10) # Speed 10
    all_sprites.add(bullet)
    bullets.add(bullet)