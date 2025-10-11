import pygame
import random
import math

# --- 1. CONFIGURATION ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Initialize Pygame and set up the window
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pygame Asteroid Shooter")
clock = pygame.time.Clock()

# --- 2. GAME OBJECT BASE CLASS ---
class GameObject(pygame.sprite.Sprite):
    def __init__(self, position, image, radius):
        super().__init__()
        self.image_original = image
        self.image = image
        self.rect = self.image.get_rect(center=position)
        self.radius = radius
        self.pos = pygame.math.Vector2(position)
        self.velocity = pygame.math.Vector2(0, 0)
        self.angle = 0  # Angle in degrees

    def update(self):
        # Apply velocity to position
        self.pos += self.velocity
        
        # Wrap-around screen logic
        if self.pos.x > SCREEN_WIDTH:
            self.pos.x = 0
        elif self.pos.x < 0:
            self.pos.x = SCREEN_WIDTH
        if self.pos.y > SCREEN_HEIGHT:
            self.pos.y = 0
        elif self.pos.y < 0:
            self.pos.y = SCREEN_HEIGHT

        self.rect.center = (int(self.pos.x), int(self.pos.y))
        
    def draw(self, surface):
        surface.blit(self.image, self.rect)

# --- 3. SHIP CLASS ---
class Ship(GameObject):
    def __init__(self):
        # Use a simple white triangle image for retro style
        ship_surface = pygame.Surface((30, 30), pygame.SRCALPHA)
        pygame.draw.polygon(ship_surface, WHITE, [(15, 0), (0, 30), (30, 30)])
        
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

# --- 4. BULLET CLASS ---
class Bullet(GameObject):
    def __init__(self, position, velocity):
        # Bullet is a small white circle
        bullet_surface = pygame.Surface((4, 4), pygame.SRCALPHA)
        pygame.draw.circle(bullet_surface, WHITE, (2, 2), 2)
        
        super().__init__(position, bullet_surface, 2)
        self.velocity = velocity
        self.lifetime = 100 # How many frames it lasts

    def update(self):
        super().update()
        self.lifetime -= 1
        if self.lifetime <= 0:
            self.kill() # Remove the bullet from all groups

# --- 5. ASTEROID CLASS ---
class Asteroid(GameObject):
    def __init__(self, size):
        self.size = size # 3 (Large), 2 (Medium), 1 (Small)
        radius_map = {3: 40, 2: 25, 1: 15}
        self.radius = radius_map[size]
        
        # Create a simple asteroid shape (circle)
        asteroid_surface = pygame.Surface((self.radius * 2, self.radius * 2), pygame.SRCALPHA)
        pygame.draw.circle(asteroid_surface, WHITE, (self.radius, self.radius), self.radius, 1) # Hollow circle
        
        # Random starting position (avoiding center)
        start_x = random.choice([random.randrange(0, SCREEN_WIDTH//4), random.randrange(3*SCREEN_WIDTH//4, SCREEN_WIDTH)])
        start_y = random.choice([random.randrange(0, SCREEN_HEIGHT//4), random.randrange(3*SCREEN_HEIGHT//4, SCREEN_HEIGHT)])
        
        super().__init__((start_x, start_y), asteroid_surface, self.radius)
        
        # Random velocity
        angle = random.uniform(0, 360)
        speed = 10 / self.size # Smaller asteroids move faster
        rad = math.radians(angle)
        self.velocity = pygame.math.Vector2(math.cos(rad) * speed, math.sin(rad) * speed)
        
    def split(self, all_sprites, asteroids):
        """Splits the asteroid into two smaller ones"""
        if self.size > 1:
            new_size = self.size - 1
            for _ in range(2):
                new_asteroid = Asteroid(new_size)
                new_asteroid.pos = self.pos.copy() # Start from the explosion point
                
                # Give the new asteroid a slightly randomized velocity
                new_asteroid.velocity = self.velocity.rotate(random.uniform(-45, 45))
