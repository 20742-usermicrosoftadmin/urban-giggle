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